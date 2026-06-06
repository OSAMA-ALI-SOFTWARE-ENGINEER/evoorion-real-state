<?php

namespace App\Observers;

use App\Models\Property;
use App\Models\PropertyPriceHistory;

class PropertyObserver
{
    public function created(Property $property): void
    {
        PropertyPriceHistory::create([
            'property_id' => $property->id,
            'price'       => $property->price,
            'currency'    => $property->currency,
            'changed_by'  => auth()->id(),
        ]);
    }

    public function updating(Property $property): void
    {
        if (!$property->isDirty('price')) {
            return;
        }

        PropertyPriceHistory::create([
            'property_id' => $property->id,
            'price'       => $property->price,
            'currency'    => $property->currency,
            'changed_by'  => auth()->id(),
        ]);
    }
}
