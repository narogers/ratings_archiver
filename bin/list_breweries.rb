#!/usr/bin/env ruby
require 'dotenv'
Dotenv.load

require 'ap'
require 'csv'
require 'optparse'

# Start by parsing the name of the input file along with the encoding. By default it is
# assumed to be ISO 8859-1 since most Excel spreadsheets are in this format
options = {}
OptionParser.new do |opts|
  options[:input] = ''
  options[:encoding] = 'ISO-8859-1'
  options[:delimiter] = '|'
  options[:log] = STDOUT

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

  opts.on('-o OUTPUT', '--output OUTPUT', 'Output file - must be in current working directory') do |o|
    options[:output] = o
  end
end.parse!

# Since it needs something to parse throw an exception if you run into a problem
raise OptionParser::MissingArgument if options[:input].empty?
if (not File.exists?(options[:input]))
  puts "Could not locate #{options[:input]} for processing" 
  raise OptionParser::InvalidArgument 
end

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
breweries = {}
ratings = CSV.read(options[:input], "r:#{options[:encoding]}:UTF-8", 
  { col_sep: options[:delimiter] })
# Pop off the first row assuming that it is a list of fields rather than an actual
# value
ratings.shift
ratings.each do |rating| 
  brewery = rating[2]
  breweries[brewery] = [] unless breweries.member? brewery
  breweries[brewery].push rating[1]
end

if options[:output].equal? STDOUT
  ap breweries.keys.sort
else
  File.open(options[:output], mode: 'a') { |f|
    breweries.keys.sort.each do |brewery|
      f.puts "#{brewery} (#{breweries[brewery].length})"
    end
  }
end
