require 'rubygems'

require 'sinatra'
require 'sinatra/twitter-bootstrap'

require 'active_record'
require 'sqlite3'
require 'dotenv'
Dotenv.load

class RatingsArchiver < Sinatra::Base
  register Sinatra::Twitter::Bootstrap::Assets
  database_configuration = YAML::load(File.open('config/database.yml'))
  ActiveRecord::Base.establish_connection(database_configuration)

  get '/' do
    'Hello world'
  end
end
