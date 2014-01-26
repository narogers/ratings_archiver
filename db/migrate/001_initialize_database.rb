class InitializeDatabase < ActiveRecord::Migration
  def change
    create_table :breweries do |t|
      t.string :brewerydb_id
      t.string :name
      t.string :website
      t.string :twitter
      t.string :facebook
      t.text :description
      
      t.string :country
      t.string :state
      t.string :city
      t.float :latitude
      t.float :longitude  
    end

    create_table :ratings do |t|
      t.string :ratebeer_id
      t.string :brewerydb_id
      
      t.integer :brewer
      t.string :name
      t.text :description
      t.float :abv
      # This should really be a controlled list at some point but for a 
      # first pass a text field is fine
      t.string :style

      t.integer :aroma
      t.integer :appearance
      t.integer :flavor
      t.integer :palate
      t.integer :overall
      t.float :computed_score
      
      t.text :review
      t.datetime :rated_on
      # This should also be a controlled list once the proof of concept
      # is finished
      t.string :format      
    end
  end
end
