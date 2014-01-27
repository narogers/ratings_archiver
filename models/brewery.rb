class Brewery < ActiveRecord::Base
  scope :missing_coordinates, -> { where(latitude: nil, longitude: nil) }

  has_many :ratings
end
