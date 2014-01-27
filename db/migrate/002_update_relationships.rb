class UpdateRelationships < ActiveRecord::Migration
  def change
    change_table :ratings do |t|
      t.belongs_to :brewery
    end
  end
end
