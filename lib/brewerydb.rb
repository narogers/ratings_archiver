# Based off of the brewerydb gem from https://github.com/cmar/brewerydb
require 'hashie'
require 'httparty'

class BreweryDb
  include HTTParty
  base_uri 'http://api.brewerydb.com/v2'
  format :json
  default_params format: 'JSON'
  
  @@api_key = nil

  # Resole a brewery based on name. If you get more than one result the city, state, and
  # country fields can be used to refine the results to the right value 
  def self.brewery(name, limits={city: '', state: '', country: ''})
    options = {
      name: name,
    }
    endpoint = '/breweries'
 
    response = json_request(endpoint, options) 

    # Need to iterate over the results set. First do some normalization to shift everything
    # to lowercase then do a direct string comparison. If  you get a hit then return that.
    # If not then iterate over the list a second time and return the first result that
    # matches the given city, state, and country. If all else fails match on the brewery
    # whose leading characters match
    brewery = nil 
    response.each do |b|
       if b[:name].downcase.eql? name.downcase
         brewery = b
         break
       end
    end unless response.nil?
   
    if brewery.nil?
       warn "<< Brewery could not be validated >>"
    end
   
    brewery
  end
  
  # After resolving the brewery's ID you can then get additional information. With a
  # premium BreweryDB account you can merge these two but that currently costs $60 per
  # year
  #
  # This is hardly robust which means that it will assume there is only one result. If 
  # not then try with a different ID
  def self.brewery_location(id)
    options = {}
    endpoint = "/brewery/#{id}/locations"
    
    response = json_request(endpoint, options)
    response.empty? ? nil : response.first
  end

  def self.beers_by_brewery(brewery_id)
    options = {}
    endpoint = "/brewery/#{brewery_id}/beers"
    response = json_request(endpoint, options)
  end

  def self.beers(name, brewery='')
    options = {
      q: name,
      type: 'beer',
      withBreweries: 'Y'
    }
    endpoint = "/search"
    response = json_request(endpoint, options)

    # As there appears to be no way of easily searching by brewery or
    # beer with a parameter to limit the results use a brute force method
    # for the time being
    unless brewery.empty?
      response.each do |result|
        ap result
        puts '==='
     end
    end
  end

  def self.api_key=(key)
    @@api_key = key
  end
  
  def self.api_key
    @@api_key
  end

  def self.json_request(endpoint, options={})
    # TODO : Stop failing silently if the API key is nil
    return nil unless not api_key.nil?
    options.merge!({
      key: api_key
    })
    response = get(endpoint, query: options)
    Hashie::Mash.new(response)['data'] if response.code == 200
  end
end
