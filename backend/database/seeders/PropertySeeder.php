<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Developer;
use App\Models\OperationType;
use App\Models\Property;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        // Wipe existing property data (cascade handles images/amenities/favorites)
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('property_favorites')->truncate();
        DB::table('property_amenities')->truncate();
        DB::table('property_images')->truncate();
        DB::table('property_agent_assignments')->truncate();
        Property::withTrashed()->forceDelete();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $areas    = Area::all()->keyBy('slug');
        $devs     = Developer::all()->keyBy('name');
        $opTypes  = OperationType::all()->keyBy('name');

        $buyId  = $opTypes['Buy']?->id  ?? $opTypes->first()?->id;
        $rentId = $opTypes['Rent']?->id ?? $buyId;

        // Unsplash image collections (Dubai luxury real estate aesthetic)
        $exteriors = [
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80',
        ];
        $interiors = [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1560185893-a55cbc8c57e1?auto=format&fit=crop&w=1400&q=80',
        ];

        $properties = [
            [
                'title'            => 'Palm Jumeirah Signature Villa',
                'description'      => "Set on the exclusive Palm Jumeirah, this five-bedroom signature villa redefines luxury living. Commanding sweeping views of the Arabian Gulf and the iconic Dubai skyline, the property features an expansive open-plan living area flooded with natural light, a resort-style infinity pool, private beach access, and a state-of-the-art home cinema.\n\nThe master suite spans the entire upper floor, with a private terrace, walk-in wardrobe, and a spa-inspired bathroom finished in Italian marble. Four additional ensuite bedrooms accommodate family and guests in equal comfort. A fully equipped smart-home system, dedicated staff quarters, and a three-car garage complete this extraordinary residence.",
                'type'             => 'villa',
                'price'            => 15_500_000,
                'currency'         => 'AED',
                'area_id'          => $areas['palm-jumeirah']?->id,
                'location'         => 'Frond K, Palm Jumeirah, Dubai',
                'area_sqft'        => 8_400,
                'bedrooms'         => 5,
                'bathrooms'        => 6,
                'operation_type_id'=> $buyId,
                'status'           => 'available',
                'is_featured'      => true,
                'roi_min'          => 5,
                'roi_max'          => 8,
                'developer_id'     => $devs['Emaar']?->id,
                'meta_title'       => 'Palm Jumeirah Signature Villa | Evoorion',
                'meta_description' => '5-bedroom beachfront villa on Palm Jumeirah with infinity pool, private beach, and panoramic Gulf views.',
                'amenities'        => ['Private Beach', 'Infinity Pool', 'Home Cinema', 'Smart Home', 'Staff Quarters', 'Three-Car Garage', 'Gym', 'Sauna'],
                'images'           => [
                    ['url' => $exteriors[0], 'caption' => 'Villa Exterior', 'is_primary' => true, 'order' => 0],
                    ['url' => $exteriors[3], 'caption' => 'Pool & Garden', 'is_primary' => false, 'order' => 1],
                    ['url' => $interiors[0], 'caption' => 'Living Room', 'is_primary' => false, 'order' => 2],
                    ['url' => $interiors[2], 'caption' => 'Dining Area', 'is_primary' => false, 'order' => 3],
                    ['url' => $interiors[3], 'caption' => 'Master Bedroom', 'is_primary' => false, 'order' => 4],
                    ['url' => $interiors[4], 'caption' => 'Modern Kitchen', 'is_primary' => false, 'order' => 5],
                ],
                'videos' => [
                    ['url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'caption' => 'Full Property Walk-Through', 'order' => 10],
                ],
                'files' => [
                    ['url' => 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf', 'caption' => 'Floor Plan', 'file_name' => 'Palm-Jumeirah-Villa-Floor-Plan.pdf', 'order' => 20],
                    ['url' => 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf', 'caption' => 'Property Brochure', 'file_name' => 'Palm-Jumeirah-Villa-Brochure.pdf', 'order' => 21],
                ],
            ],
            [
                'title'            => 'Downtown Dubai Sky Suite Penthouse',
                'description'      => "A crown jewel above the city, this ultra-luxury penthouse commands an unobstructed panorama of the Burj Khalifa and the glittering Dubai Fountain. Spread across the full top floor, the four-bedroom residence offers 6,200 sq ft of curated living space wrapped in floor-to-ceiling glass.\n\nThe interiors by a leading Italian design house feature hand-laid marble flooring, bespoke cabinetry, and a show-stopping wraparound terrace of 1,800 sq ft — perfect for entertaining against the world's most recognisable skyline. A private elevator lobby, dedicated concierge, and valet parking ensure an unparalleled lifestyle.",
                'type'             => 'penthouse',
                'price'            => 22_000_000,
                'currency'         => 'AED',
                'area_id'          => $areas['downtown-dubai']?->id,
                'location'         => 'Opera District, Downtown Dubai',
                'area_sqft'        => 6_200,
                'bedrooms'         => 4,
                'bathrooms'        => 5,
                'operation_type_id'=> $buyId,
                'status'           => 'available',
                'is_featured'      => true,
                'roi_min'          => 4,
                'roi_max'          => 6,
                'developer_id'     => $devs['Emaar']?->id,
                'meta_title'       => 'Downtown Dubai Penthouse with Burj Khalifa View | Evoorion',
                'meta_description' => 'Ultra-luxury 4-bedroom penthouse in Downtown Dubai with panoramic Burj Khalifa views and 1,800 sq ft terrace.',
                'amenities'        => ['Burj Khalifa View', 'Private Terrace', 'Private Elevator', 'Concierge', 'Valet Parking', 'Gym', 'Pool', 'Wine Cellar'],
                'images'           => [
                    ['url' => $exteriors[5], 'caption' => 'Tower Exterior', 'is_primary' => true, 'order' => 0],
                    ['url' => $interiors[1], 'caption' => 'Open-Plan Living', 'is_primary' => false, 'order' => 1],
                    ['url' => $interiors[2], 'caption' => 'Formal Dining', 'is_primary' => false, 'order' => 2],
                    ['url' => $interiors[3], 'caption' => 'Master Suite', 'is_primary' => false, 'order' => 3],
                    ['url' => $interiors[5], 'caption' => 'Luxury Bedroom', 'is_primary' => false, 'order' => 4],
                ],
                'videos' => [
                    ['url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'caption' => 'Penthouse Virtual Tour', 'order' => 10],
                ],
                'files' => [
                    ['url' => 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf', 'caption' => 'Floor Plan', 'file_name' => 'Downtown-Penthouse-Floor-Plan.pdf', 'order' => 20],
                ],
            ],
            [
                'title'            => 'Dubai Marina Waterfront Apartment',
                'description'      => "Wake up to yachts and turquoise water in this beautifully appointed two-bedroom apartment in the heart of Dubai Marina. The open-plan layout maximises the full-length balcony view, where the marina promenade and the Arabian Gulf stretch out before you.\n\nThe property features a designer kitchen with integrated appliances, spa-quality bathrooms with rainfall showers, and custom joinery throughout. Residents enjoy exclusive access to the rooftop infinity pool, state-of-the-art gym, and a private beach club just minutes away.",
                'type'             => 'apartment',
                'price'            => 2_850_000,
                'currency'         => 'AED',
                'area_id'          => $areas['dubai-marina']?->id,
                'location'         => 'Marina Promenade, Dubai Marina',
                'area_sqft'        => 1_650,
                'bedrooms'         => 2,
                'bathrooms'        => 2,
                'operation_type_id'=> $buyId,
                'status'           => 'available',
                'is_featured'      => true,
                'roi_min'          => 6,
                'roi_max'          => 9,
                'developer_id'     => $devs['Emaar']?->id,
                'meta_title'       => 'Dubai Marina 2-Bedroom Waterfront Apartment | Evoorion',
                'meta_description' => 'Contemporary 2-bed apartment in Dubai Marina with direct marina views, rooftop pool, and beach club access.',
                'amenities'        => ['Marina View', 'Rooftop Pool', 'Beach Club Access', 'Gym', 'Covered Parking', 'Concierge', '24/7 Security'],
                'images'           => [
                    ['url' => $exteriors[4], 'caption' => 'Building Facade', 'is_primary' => true, 'order' => 0],
                    ['url' => $interiors[0], 'caption' => 'Living & Dining', 'is_primary' => false, 'order' => 1],
                    ['url' => $interiors[4], 'caption' => 'Open Kitchen', 'is_primary' => false, 'order' => 2],
                    ['url' => $interiors[3], 'caption' => 'Master Bedroom', 'is_primary' => false, 'order' => 3],
                ],
                'videos' => [
                    ['url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'caption' => 'Apartment Tour', 'order' => 10],
                ],
                'files' => [
                    ['url' => 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf', 'caption' => 'Floor Plan', 'file_name' => 'Marina-Apartment-Floor-Plan.pdf', 'order' => 20],
                    ['url' => 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf', 'caption' => 'Building Brochure', 'file_name' => 'Marina-Tower-Brochure.pdf', 'order' => 21],
                ],
            ],
            [
                'title'            => 'Emirates Hills Grand Estate',
                'description'      => "Known as the 'Beverly Hills of Dubai', Emirates Hills is home to some of the most prestigious estates in the region. This six-bedroom grand estate commands a prime position overlooking the manicured fairways of the Montgomery Golf Course.\n\nSet on 18,000 sq ft of land, the property features a palatial entrance hall with double-height ceilings, a formal reception, family lounge, cinema room, and a spectacular chef's kitchen. Outside, a resort-style pool with waterfall feature, a covered entertainment terrace, and a fully equipped outdoor kitchen make this an entertainer's paradise.",
                'type'             => 'villa',
                'price'            => 38_000_000,
                'currency'         => 'AED',
                'area_id'          => $areas['emirates-hills']?->id,
                'location'         => 'Sector E, Emirates Hills, Dubai',
                'area_sqft'        => 12_800,
                'bedrooms'         => 6,
                'bathrooms'        => 8,
                'operation_type_id'=> $buyId,
                'status'           => 'available',
                'is_featured'      => true,
                'roi_min'          => 3,
                'roi_max'          => 5,
                'developer_id'     => $devs['Emaar']?->id,
                'meta_title'       => 'Emirates Hills Grand Estate | Golf Course View | Evoorion',
                'meta_description' => '6-bedroom grand estate in Emirates Hills with golf course views, resort pool, and 12,800 sq ft of luxury living.',
                'amenities'        => ['Golf Course View', 'Resort Pool', 'Cinema Room', 'Outdoor Kitchen', 'Staff Quarters', 'Tennis Court', 'Smart Home', 'Six-Car Garage'],
                'images'           => [
                    ['url' => $exteriors[1], 'caption' => 'Estate Exterior', 'is_primary' => true, 'order' => 0],
                    ['url' => $exteriors[3], 'caption' => 'Pool & Terrace', 'is_primary' => false, 'order' => 1],
                    ['url' => $interiors[0], 'caption' => 'Grand Living Hall', 'is_primary' => false, 'order' => 2],
                    ['url' => $interiors[2], 'caption' => 'Formal Dining', 'is_primary' => false, 'order' => 3],
                    ['url' => $interiors[4], 'caption' => "Chef's Kitchen", 'is_primary' => false, 'order' => 4],
                    ['url' => $interiors[5], 'caption' => 'Master Suite', 'is_primary' => false, 'order' => 5],
                ],
                'videos' => [
                    ['url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'caption' => 'Estate Tour Video', 'order' => 10],
                ],
                'files' => [
                    ['url' => 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf', 'caption' => 'Floor Plans (All Levels)', 'file_name' => 'Emirates-Hills-Estate-Floor-Plans.pdf', 'order' => 20],
                    ['url' => 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf', 'caption' => 'Property Brochure', 'file_name' => 'Emirates-Hills-Estate-Brochure.pdf', 'order' => 21],
                    ['url' => 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf', 'caption' => 'Site Plan', 'file_name' => 'Emirates-Hills-Site-Plan.pdf', 'order' => 22],
                ],
            ],
            [
                'title'            => 'Al Barari Forest Retreat Townhouse',
                'description'      => "Nestled within 60% landscaped green space, Al Barari is Dubai's most exclusive eco-luxury community. This three-bedroom townhouse immerses residents in lush botanical gardens while keeping them minutes from the city.\n\nThe residence features a generous open-plan ground floor that flows to a private garden terrace, three ensuite bedrooms with built-in wardrobes, and a rooftop terrace with pergola. Al Barari's world-class facilities include a farm-to-table restaurant, an award-winning spa, and multiple temperature-controlled pools set within the verdant landscape.",
                'type'             => 'townhouse',
                'price'            => 4_200_000,
                'currency'         => 'AED',
                'area_id'          => $areas['al-barari']?->id,
                'location'         => 'Ashjar, Al Barari, Dubai',
                'area_sqft'        => 3_100,
                'bedrooms'         => 3,
                'bathrooms'        => 4,
                'operation_type_id'=> $buyId,
                'status'           => 'available',
                'is_featured'      => false,
                'roi_min'          => 5,
                'roi_max'          => 7,
                'developer_id'     => $devs['Meraas']?->id,
                'meta_title'       => 'Al Barari Eco-Luxury Townhouse | Evoorion',
                'meta_description' => '3-bedroom forest retreat townhouse in Al Barari with private garden, rooftop terrace, and world-class spa access.',
                'amenities'        => ['Private Garden', 'Rooftop Terrace', 'Spa Access', 'Farm-to-Table Restaurant', 'Temperature-Controlled Pools', 'Jogging Trails', 'Yoga Studio'],
                'images'           => [
                    ['url' => $exteriors[2], 'caption' => 'Townhouse Exterior', 'is_primary' => true, 'order' => 0],
                    ['url' => $interiors[1], 'caption' => 'Living Room', 'is_primary' => false, 'order' => 1],
                    ['url' => $interiors[4], 'caption' => 'Kitchen', 'is_primary' => false, 'order' => 2],
                    ['url' => $interiors[3], 'caption' => 'Bedroom', 'is_primary' => false, 'order' => 3],
                ],
                'videos' => [],
                'files' => [
                    ['url' => 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf', 'caption' => 'Floor Plan', 'file_name' => 'Al-Barari-Townhouse-Floor-Plan.pdf', 'order' => 20],
                ],
            ],
            [
                'title'            => 'Dubai Marina Studio — Premium Rental',
                'description'      => "An intelligently designed studio in one of Dubai Marina's most sought-after residential towers. Fully furnished to a high specification with a dedicated workspace, the property is ideal for professionals and frequent visitors.\n\nThe building offers a rooftop pool, gym, and 24-hour concierge. Directly connected to the Dubai Marina Walk, residents enjoy immediate access to world-class dining, retail, and the metro.",
                'type'             => 'apartment',
                'price'            => 95_000,
                'currency'         => 'AED',
                'area_id'          => $areas['dubai-marina']?->id,
                'location'         => 'Marina Gate, Dubai Marina',
                'area_sqft'        => 560,
                'bedrooms'         => 0,
                'bathrooms'        => 1,
                'operation_type_id'=> $rentId,
                'status'           => 'available',
                'is_featured'      => false,
                'roi_min'          => 7,
                'roi_max'          => 10,
                'developer_id'     => $devs['Damac']?->id,
                'meta_title'       => 'Dubai Marina Studio for Rent | Furnished | Evoorion',
                'meta_description' => 'Premium furnished studio in Dubai Marina. Rooftop pool, gym, and concierge. Annual rent AED 95,000.',
                'amenities'        => ['Fully Furnished', 'Rooftop Pool', 'Gym', 'Concierge', 'Metro Access', 'Marina Walk Access', 'High-Speed Internet'],
                'images'           => [
                    ['url' => $interiors[1], 'caption' => 'Studio Interior', 'is_primary' => true, 'order' => 0],
                    ['url' => $interiors[4], 'caption' => 'Kitchen', 'is_primary' => false, 'order' => 1],
                    ['url' => $exteriors[4], 'caption' => 'Building Exterior', 'is_primary' => false, 'order' => 2],
                ],
                'videos' => [],
                'files' => [],
            ],
            [
                'title'            => 'Downtown Dubai 3-Bedroom Apartment',
                'description'      => "Positioned in the prestigious Opera District, this generously proportioned three-bedroom apartment offers a front-row seat to Dubai's most iconic landmarks. The floor-to-ceiling glazing frames a direct view of the Burj Khalifa and Dubai Fountain — a spectacle that never grows old.\n\nThe interior has been finished to a four-star hotel standard with premium flooring, integrated kitchen appliances, and designer bathrooms. Building amenities include a resort pool deck, fitness centre, and valet parking. Situated within walking distance of The Dubai Mall, fine-dining, and the RTA water taxi, the location is truly second to none.",
                'type'             => 'apartment',
                'price'            => 5_800_000,
                'currency'         => 'AED',
                'area_id'          => $areas['downtown-dubai']?->id,
                'location'         => 'Opera District, Downtown Dubai',
                'area_sqft'        => 2_100,
                'bedrooms'         => 3,
                'bathrooms'        => 3,
                'operation_type_id'=> $buyId,
                'status'           => 'available',
                'is_featured'      => false,
                'roi_min'          => 5,
                'roi_max'          => 7,
                'developer_id'     => $devs['Emaar']?->id,
                'meta_title'       => 'Downtown Dubai 3-Bedroom with Burj Khalifa View | Evoorion',
                'meta_description' => 'Spacious 3-bedroom apartment in the Opera District with direct Burj Khalifa and fountain views.',
                'amenities'        => ['Burj Khalifa View', 'Dubai Fountain View', 'Resort Pool', 'Fitness Centre', 'Valet Parking', 'Concierge', 'Kids Pool'],
                'images'           => [
                    ['url' => $exteriors[5], 'caption' => 'Residential Tower', 'is_primary' => true, 'order' => 0],
                    ['url' => $interiors[0], 'caption' => 'Open-Plan Living', 'is_primary' => false, 'order' => 1],
                    ['url' => $interiors[2], 'caption' => 'Dining Room', 'is_primary' => false, 'order' => 2],
                    ['url' => $interiors[4], 'caption' => 'Modern Kitchen', 'is_primary' => false, 'order' => 3],
                    ['url' => $interiors[5], 'caption' => 'Bedroom', 'is_primary' => false, 'order' => 4],
                ],
                'videos' => [
                    ['url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'caption' => 'Apartment Walk-Through', 'order' => 10],
                ],
                'files' => [
                    ['url' => 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf', 'caption' => 'Floor Plan', 'file_name' => 'Downtown-3BR-Floor-Plan.pdf', 'order' => 20],
                ],
            ],
            [
                'title'            => 'Palm Jumeirah Sea-View Apartment',
                'description'      => "On the iconic Palm Jumeirah, this two-bedroom apartment sits within an exclusive low-rise residence offering unobstructed sea views and direct beach access. The wide balcony — spanning the full width of the apartment — creates a seamless indoor-outdoor living experience.\n\nThe bespoke kitchen opens to the living area, which is bathed in natural light from floor-to-ceiling glass doors leading to the terrace. Both bedrooms feature en-suite bathrooms with premium fittings. Residents enjoy a private beach, temperature-controlled pool, and proximity to Nakheel Mall.",
                'type'             => 'apartment',
                'price'            => 4_500_000,
                'currency'         => 'AED',
                'area_id'          => $areas['palm-jumeirah']?->id,
                'location'         => 'The Palm Crescent, Palm Jumeirah',
                'area_sqft'        => 1_850,
                'bedrooms'         => 2,
                'bathrooms'        => 2,
                'operation_type_id'=> $buyId,
                'status'           => 'available',
                'is_featured'      => false,
                'roi_min'          => 5,
                'roi_max'          => 8,
                'developer_id'     => $devs['Emaar']?->id,
                'meta_title'       => 'Palm Jumeirah 2-Bedroom Sea View Apartment | Evoorion',
                'meta_description' => '2-bedroom apartment on Palm Jumeirah with panoramic sea views, private beach, and resort-style pool.',
                'amenities'        => ['Sea View', 'Private Beach', 'Temperature-Controlled Pool', 'Gym', 'Sauna', 'Covered Parking', '24/7 Security'],
                'images'           => [
                    ['url' => $exteriors[4], 'caption' => 'Beachfront Building', 'is_primary' => true, 'order' => 0],
                    ['url' => $interiors[0], 'caption' => 'Living Area', 'is_primary' => false, 'order' => 1],
                    ['url' => $interiors[3], 'caption' => 'Master Bedroom', 'is_primary' => false, 'order' => 2],
                    ['url' => $interiors[4], 'caption' => 'Kitchen', 'is_primary' => false, 'order' => 3],
                ],
                'videos' => [],
                'files' => [
                    ['url' => 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf', 'caption' => 'Floor Plan', 'file_name' => 'Palm-Apartment-Floor-Plan.pdf', 'order' => 20],
                ],
            ],
        ];

        foreach ($properties as $data) {
            $amenities = $data['amenities'];
            $images    = $data['images'];
            $videos    = $data['videos'];
            $files     = $data['files'];

            unset($data['amenities'], $data['images'], $data['videos'], $data['files']);

            $property = Property::create($data);

            // Amenities
            foreach ($amenities as $amenity) {
                $property->amenities()->create(['amenity' => $amenity]);
            }

            // Images
            foreach ($images as $img) {
                $property->images()->create([
                    'url'        => $img['url'],
                    'is_primary' => $img['is_primary'],
                    'order'      => $img['order'],
                    'type'       => 'image',
                    'caption'    => $img['caption'] ?? null,
                ]);
            }

            // Videos
            foreach ($videos as $vid) {
                $property->images()->create([
                    'url'        => $vid['url'],
                    'is_primary' => false,
                    'order'      => $vid['order'],
                    'type'       => 'video',
                    'caption'    => $vid['caption'] ?? null,
                ]);
            }

            // Files
            foreach ($files as $file) {
                $property->images()->create([
                    'url'        => $file['url'],
                    'is_primary' => false,
                    'order'      => $file['order'],
                    'type'       => 'file',
                    'caption'    => $file['caption'] ?? null,
                    'file_name'  => $file['file_name'] ?? null,
                ]);
            }
        }

        $this->command->info('PropertySeeder: 8 properties with images, videos, and files created.');
    }
}
