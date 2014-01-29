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
      '/js/application.js'
    ]
    js :leaflet, [
      '/js/lib/d3graph.js',
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
   
  get %r{summary(\/\d{4})?(\/\d{2})?} do |year=nil, month=nil|
    puts params
    @ratings = collectRatings()
    @range = createRangeLabel(@ratings) 

    haml :summary, format: :html5 
  end

  get %r{ratings(\/\d{4})?(\/\d{2})?} do |year=nil, month=nil|
    Rating.all.order(:rated_on).to_json(except: [:review])
  end

  private
    def collectRatings(year: nil, month: nil)
      ratings = Rating.all.order(:rated_on)
    end

    def createRangeLabel(ratings)
      rated_by_time = ratings.order(:rated_on)
      start = rated_by_time.first
      finish = rated_by_time.last
   
      output = ""
      if finish.rated_on.year == start.rated_on.year
        if finish.rated_on.month == start.rated_on.month
          output = start.rated_on.strftime('%B') + ' to ' +
            finish.rated_on.strftime('%B %Y')
        else
          output = start.rated_on.strftime('%B %Y')
        end
      else
        output = start.rated_on.strftime('%B %Y') + ' to ' +
          finish.rated_on.strftime('%B %Y') 
      end

      output
    end
end
