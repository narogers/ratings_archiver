#!/usr/bin/env ruby
require 'dotenv'
Dotenv.load

require 'ap'
require 'sinatra/activerecord'
require 'csv'
require 'optparse'
require 'require_all'

# Local classes to include
require_rel '../app'
require_rel '../lib'

# Start by parsing the name of the input file along with the encoding. By default it is
# assumed to be ISO 8859-1 since most Excel spreadsheets are in this format
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
  puts "<< Could not locate #{options[:input]} for processing >>" 
  raise OptionParser::InvalidArgument 
end

# Don't forget to set up ActiveRecord since this is not done automatically for us
# like in Rails
database_configuration = YAML::load(File.open('config/database.yml'))
ActiveRecord::Base.establish_connection(database_configuration)

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
ratings = CSV.read(options[:input], "r:#{options[:encoding]}", 
  { col_sep: options[:delimiter] })
ratings[1..10].each do |rating| 
  puts "<< Importing #{rating[1]} (#{rating[0]}) >>"

  if Rating.exists?(ratebeer_id: rating[0]) then 
    puts "<< UPDATE OR SKIP RECORD >>"
  else
    rating = Rating.new(
      ratebeer_id: rating[0],
      name: rating[1],
      appearance: rating[3],
      aroma: rating[4],
      flavor: rating[5],
      palate: rating[6],
      overall: rating[7],
      computed_score: rating[8],
      review: rating[9],
      rated_on: DateTime.parse(rating[10]),
    ).save!
    puts "<< Adding beer to local database >>"
  end
end
