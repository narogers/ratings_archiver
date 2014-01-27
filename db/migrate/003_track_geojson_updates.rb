class TrackGeojsonUpdates < ActiveRecord::Migration
  change_table :breweries do |t|
    t.datetime :last_location_update_on
  end
end
