require 'rubygems'

require 'sinatra'
require 'sinatra/assetpack'
require 'haml'

require 'active_record'
require 'sqlite3'
require 'dotenv'
Dotenv.load

class RatingsArchiver < Sinatra::Base
  #register Sinatra::Twitter::Bootstrap::Assets
  database_configuration = YAML::load(File.open('config/database.yml'))
  ActiveRecord::Base.establish_connection(database_configuration)
 
  set :root, File.dirname(__FILE__)
  register Sinatra::AssetPack

  # Use the defaults in assetpack for now
  assets {
    serve '/js', from: 'assets/js'
    serve '/css', from: 'assets/css'
    serve '/images', from: 'assets/images'
  
    # Package up the Javascript assets which are stored mostly in the vendor
    # subdirectory underneath /app/js
    js :app, '/js/ratings-archiver.js', [
      '/js/vendor/**/*.js',
      '/js/application.js'
    ]
    # Do the same for the CSS source files
    css :application, '/css/ratings-archiver.css', [
      '/css/vendor/**/*.js',
      '/css/application.css'
    ]
    js_compression :jsmin
    css_compression :sass  
  }

  # One last detail before getting down to business - pointing to our
  # subdirectory of views
  set :views, Proc.new { File.join(root, "views") }

  get '/' do
    'Hello world'
  end
 
  get '/d3demo' do
    haml :d3demo, format: :html5
  end
end
