require 'rubygems'

require 'sinatra'
require 'sinatra/assetpack'
require 'haml'
require 'sass'

require 'active_record'
require 'sqlite3'
require 'dotenv'
Dotenv.load

require 'require_all'
require_rel 'lib'
require_rel 'models'

require 'pry'

class RatingsArchiver < Sinatra::Base
  register Sinatra::Twitter::Bootstrap::Assets
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
    js :app, [
      '/js/vendor/**/*.js',
      '/js/lib/d3graph.js',
      '/js/application.js'
    ]
    js :leaflet, [
      '/js/d3tutorial.js',
    ]

    # Do the same for the CSS source files
    css :application, [
      '/css/vendor/**/*.css',
      '/css/application.css'
    ]
    css :leaflet_tutorial, [
      '/css/testFile.css',
      '/css/d3tutorial.css'
    ] 
    
    js_compression :jsmin
    css_compression :sass  
  }

  # One last detail before getting down to business - pointing to our
  # subdirectory of views
  set :views, Proc.new { File.join(root, "views") }
  set :haml, { format: :html5 }
 
  # With no extension get the summary for all ratings 
  get '/' do
    'Hello world'
  end
  get '/d3demo' do
    haml :d3demo
  end
   
  get '/summary' do
    @timeRange = getRange()
    @callback = '/ratings'
    @title = "#{@timeRange[:from][:label]} to #{@timeRange[:to][:label]}" 

    haml :summary, format: :html5 
  end

  get '/summary/:year' do
    @timeRange = getRange(params[:year])
    @callback = "/ratings/#{params[:year]}"
    @title = "#{@timeRange[:from][:label]} to #{@timeRange[:to][:label]}" 
    
    haml :summary, format: :html5
  end

  get '/summary/:year/:month' do
    @timeRange = getRange(params[:year], params[:month])
    @callback = "/ratings/#{params[:year]}/#{params[:month]}" 
    @title = "#{@timeRange[:from][:label]}" 
   haml :summary, format: :html5
  end 
 
  get '/ratings' do
    start_of_range = Rating.order(:rated_on).first.rated_on
    end_of_range = Time.now

    Rating.where(rated_on: start_of_range..end_of_range).order(:rated_on).to_json(except: [:description, :abv, :review, :format, :brewerydb_id])
  end

  get '/ratings/:year' do  
    start_of_range = Time.new(params[:year].to_i, 1, 1)
    end_of_range = Time.new(params[:year].to_i, 12, 31)

    Rating.where(rated_on: start_of_range..end_of_range).order(:rated_on).to_json(except: [:description, :abv, :review, :format, :brewerydb_id])
       
  end

  get '/ratings/:year/:month' do
    start_of_range = Time.new(params[:year].to_i, params[:month].to_i, 1)
    end_of_range = Time.new(params[:year].to_i, params[:month].to_i, Time.days_in_month(params[:month].to_i, params[:year].to_i))
  
    Rating.where(rated_on: start_of_range..end_of_range).order(:rated_on).to_json(except: [:description, :abv, :review, :format, :brewerydb_id])
  end

  private
    def getRange(year=nil, month=nil)
      range = {} 

      case
        when (year.present? and month.present?)
          range[:from] = { 
            year: year,
            month: month,
            label: Time.new(year, month).strftime('%B %Y')
          }
        when (year.present?)
          range[:from] = {
            year: year,
            month: 1,
            label: "January #{year}"
          }
          range[:to] = {
            year: year,
            month: 12,
            label: "December #{year}"
          }
        else
          firstRating = Rating.order(:rated_on).first.rated_on
          lastRating = Rating.order(:rated_on).last.rated_on

          range[:from] = {
            year: firstRating.year,
            month: firstRating.month,
            label: firstRating.strftime('%B %Y')
          }
          range[:to] = {
            year: lastRating.year,
            month: lastRating.month,
            label: lastRating.strftime('%B %Y')
          }
      end
     
      range
    end
end
