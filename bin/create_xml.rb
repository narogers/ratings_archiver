#!/usr/bin/env ruby
require 'ap'
require 'csv'
require 'optparse'

# Require that one pass in the name of a data file
options = {}
OptionParser.new do |opts|
  options[:input] = ''
  options[:encoding] = 'UTF-8'

  opts.banner = "Usage: create_xml.rb [options]"

  opts.on("-i", "--input INPUT", "CSV file to parse") do |i|
    options[:input] = i
  end

  opts.on("-e", "--encoding ENCODING", "Encoding for the CSV file") do |e|
    options[:encoding] = e
  end
end.parse!

# Validate that the file exists before you try to parse something that does
# not exist
raise OptionParser::MissingArgument if options[:input].nil?
if (not File.exists?(options[:input]))
  puts "<< WARNING : Could not locate #{options[:input]} >>"
  exit 1
end

# Now read the file into a hash and begin to do the clever conversion to XML.
# The format is assumed to use a pipe although this might eventually be added
# as another flag (--delimiter)
ratings = CSV.read(options[:input], "r:#{options[:encoding]}") 
ap ratings
