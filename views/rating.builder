xml.rating(id: @rating.ratebeer_id) do
  xml.date (@rating.rated_on)
  xml.brewery(id: @rating.brewerydb_id) do
    xml.name(@rating.brewery.name)
    xml.location do
      xml.country(@rating.brewery.country)
      xml.state(@rating.brewery.state) if @rating.brewery.state
      xml.city(@rating.brewery.city) if @rating.brewery.city
    end
  end
  xml.name(@rating.name)
  xml.review do
    xml.aroma(@rating.aroma)
    xml.appearance(@rating.appearance)
    xml.flavor(@rating.flavor)
    xml.palate(@rating.palate)
    xml.overall(@rating.overall)
    xml.score(@rating.computed_score)
    xml.text(@rating.review)    
  end
end
