require 'rubygems'
require 'sinatra'
require 'sinatra/twitter-bootstrap'

require 'dotenv'
Dotenv.load

class RatingsArchiver < Sinatra::Base
  register Sinatra::Twitter::Bootstrap::Assets

  get '/' do
    'Hello world'
  end
end
