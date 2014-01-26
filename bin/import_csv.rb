#!/usr/bin/env ruby
require 'ap'
require 'sinatra/activerecord'
require 'csv'
require 'optparse'

# Local classes to include
#require 'app/model'

# Start by parsing the name of the input file along with the encoding. By default it is
# assumed to be UTF-8 but most Excel spreadsheets are probably ISO 8859-1
options = {}
OptionParser.new do |opts|
  options[:input] = ''
  options[:encoding] = 'UTF-8'
  options[:delimiter] = ','
 
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

# Now that we are ready to go open the file and dump everything into a hash so it can be
# loaded into our nice ActiveRecord models after some merging of sources from BreweryDB
ratings = CSV.read(options[:input], "r:#{options[:encoding]}", 
  { col_sep: options[:delimiter] })
ap ratings
