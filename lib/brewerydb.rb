# Based off of the brewerydb gem from https://github.com/cmar/brewerydb
require 'hashie'
require 'httparty'

class BreweryDb
  include HTTParty
  base_uri 'http://api.brewerydb.com/v2'
  format :json
  default_params format: 'JSON'
  
  @@api_key = nil

  # Resolve a brewery's ID from the name and then return it so you can use it
  # as a key for doing other resolutions (location, status, etc) 
  def self.brewery_id_for(name)
    options = {
      q: name,
      type: 'brewery'
    }
    endpoint = '/search' 

    response = json_request(endpoint, options)
    # Since the default search may return more than the desired brewery the naive
    # approach will be to take the first result. This will probably require future
    # tweaking but eventually the goal is also use city and state as a validation
    # tool 
    response.first.id
  end

  # Returns only the first location at the moment as the details from
  # Ratebeer do not provide enough context to differentiate between
  # taprooms versus brewpubs versus production locations
  def self.brewery_location_for(id)
    options = {}
    endpoint = "/brewery/#{id}/locations"
    
    response = json_request(endpoint, options)
    response.first
  end

  def self.beers_by(brewery_id)
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
    return nil unless not api_key.nil?
    options.merge!({
      key: api_key
    })
    response = get(endpoint, query, options)
    Hashie::Mash.new(response)['data'] if response.code == 200
  end
end
