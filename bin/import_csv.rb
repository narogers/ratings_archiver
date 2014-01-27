#!/usr/bin/env ruby
require 'dotenv'
Dotenv.load

require 'ap'
require 'sinatra/activerecord'
require 'csv'
require 'optparse'
require 'require_all'

# Local classes to include
require_rel '../models'
require_rel '../lib'

# Start by parsing the name of the input file along with the encoding. By default it is
# assumed to be ISO 8859-1 since most Excel spreadsheets are in this format
#
# TODO : Handle the instance where the input argument is not provided more
#        gracefully than throwing a Ruby exception
options = {}
OptionParser.new do |opts|
  options[:input] = ''
  options[:encoding] = 'ISO-8859-1'
  options[:delimiter] = '|'
 
  opts.banner = "Usage: import_csv.rb [options]"
  opts.on('-i INPUT', '--input INPUT', 'CSV file to parse') do |i|
    options[:input] = i
  end

  opts.on('-e ENCODING', '--encoding ENCODING', 'Character encoding') do |e|
    options[:encoding] = e
  end
  
  opts.on('-d DELIMITER', '--delimiter DELIMITER', 'Delimiting character') do |d|
    options[:delimiter] = d
  end
end.parse!

# Since it needs something to parse throw an exception if you run into a problem
raise OptionParser::MissingArgument if options[:input].empty?
if (not File.exists?(options[:input]))
  warn "Could not locate #{options[:input]} for processing" 
  raise OptionParser::InvalidArgument 
end

# Don't forget to set up ActiveRecord since this is not done automatically for us
# like in Rails
database_configuration = YAML::load(File.open('config/database.yml'))
ActiveRecord::Base.establish_connection(database_configuration)
BreweryDb.api_key = ENV['BREWERYDB_KEY']

# Now that we are ready to go open the file and dump everything into a hash so it can be
# loaded into our nice ActiveRecord models after some merging of sources from BreweryDB
#
# The colums in a typical Ratebeer export map to
# [0]  ID
# [1]  Beer name
# [2]  Brewery
# [3]  Appearance score (1 to 10)
# [4]  Aroma score (1 to 5)
# [5]  Flavor score (1 to 10)
# [6]  Palate score (1 to 5)
# [7]  Overall score (1 to 20)
# [8]  Computed score (0.5 to 5.0)
# [9]  Review
# [10] Rating date
# [11] Country
# [12] State
# [13] City
# [14] Style
#
# Eventually all of this could be folded into a helper model which takes a row and converts
# it to a Ruby object automatically. For now let's do it manually.
ratings = CSV.read(options[:input], "r:#{options[:encoding]}:UTF-8", 
  { col_sep: options[:delimiter] })
# Pop off the first row assuming that it is a list of fields rather than an actual
# value
ratings.shift

ratings.each do |rating| 
  puts "--"
  puts "Importing #{rating[1]} (#{rating[0]})"

  if Rating.exists?(ratebeer_id: rating[0]) then 
    puts "Rating already exists - skipping entry"
  else
    reviewed_on = rating[10]
    begin
      (date, time) = reviewed_on.split(' ')[0,1]
      reviewed_on = DateTime.strptime reviewed_on, '%m/%d/%Y %I:%M:%S %p'  
    rescue ArgumentError
      puts "Could not parse date #{rating[10]} properly"
      puts "Defaulting to nil"
      reviewed_on = nil
    end
 
    brewery_name = rating[2]
    puts "Resolving brewery '#{brewery_name}' in the database(s)"

    if Brewery.exists?(name: brewery_name) then
      brewery = Brewery.find_by(name: brewery_name)
    else
      # Since BreweryDB is rate limited to 400 requests with the free account
      # per day we can't actually do the latitude and longitude import at the
      # time of creation. Instead we'll defer that to a separate script which
      # can process in batches of 100 per day after checking the rate limit
      brewery = Brewery.create(
        name: brewery_name,
        state: rating[12],
        city: rating[13],
      )
   end

    rating = Rating.create(
      ratebeer_id: rating[0],
      name: rating[1],
      appearance: rating[3],
      aroma: rating[4],
      flavor: rating[5],
      palate: rating[6],
      overall: rating[7],
      computed_score: rating[8],
      review: rating[9],
      rated_on: reviewed_on
    )

    brewery.ratings = brewery.ratings.push(rating)
    brewery.save    
    puts "#{rating.name} has been associated with #{brewery.name}"
  end
end
