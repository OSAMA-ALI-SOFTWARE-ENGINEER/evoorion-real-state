<?php

namespace Database\Seeders;

use App\Models\Area;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AreaSeeder extends Seeder
{
    public function run(): void
    {
        \DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Area::truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $areas = [
            [
                'name'              => 'Palm Jumeirah',
                'description'       => "Palm Jumeirah is Dubai's most iconic address — a man-made island shaped like a palm tree stretching into the Arabian Gulf. Home to ultra-luxury villas, five-star hotels, and exclusive beach clubs, it represents the pinnacle of Dubai real estate. Residents enjoy private beaches, marina access, and stunning 360-degree sea views. The Palm delivers strong short-term rental yields driven by its status as a global tourist landmark, while long-term capital appreciation benefits from the finite supply of beachfront land.",
                'hero_image_url'    => 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80',
                'latitude'          => 25.1124,
                'longitude'         => 55.1390,
                'long_term_roi'     => '3–5%',
                'short_term_roi'    => '7–10%',
                'appreciation'      => '6–8%',
                'off_plan_discount' => '10%',
                'price_ranges'      => [
                    ['type' => '1 Bedroom', 'min' => 449285,  'max' => 1361470],
                    ['type' => '2 Bedrooms', 'min' => 816882, 'max' => 3267528],
                    ['type' => '3+ Bedrooms', 'min' => 2500000, 'max' => 15000000],
                ],
                'meta_title'        => 'Palm Jumeirah Property Investment | Evoorion',
                'meta_description'  => 'Invest in Palm Jumeirah — Dubai\'s iconic beachfront island. Explore villas, apartments, and penthouses with sea views and 3–5% long-term rental yields.',
            ],
            [
                'name'              => 'Downtown Dubai',
                'description'       => "Downtown Dubai is the beating heart of the city — home to the Burj Khalifa, The Dubai Mall, and the Dubai Fountain. This world-famous district offers a mix of luxury apartments, serviced residences, and ultra-premium penthouses, all within walking distance of global dining and retail. Its iconic status and proximity to the DIFC financial district make it a top choice for both end-users and investors seeking consistent rental demand from professionals and tourists alike.",
                'hero_image_url'    => 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1600&q=80',
                'latitude'          => 25.1972,
                'longitude'         => 55.2744,
                'long_term_roi'     => '5–7%',
                'short_term_roi'    => '8–12%',
                'appreciation'      => '5–7%',
                'off_plan_discount' => '30%',
                'price_ranges'      => [
                    ['type' => 'Studio', 'min' => 239619,   'max' => 721579],
                    ['type' => '1 Bedroom', 'min' => 299523, 'max' => 2396187],
                    ['type' => '2 Bedrooms', 'min' => 486045, 'max' => 5990468],
                ],
                'meta_title'        => 'Downtown Dubai Property Investment | Evoorion',
                'meta_description'  => 'Own a piece of Downtown Dubai — Burj Khalifa views, world-class amenities, and 5–7% rental yields. Browse apartments and penthouses with Evoorion.',
            ],
            [
                'name'              => 'Dubai Marina',
                'description'       => "Dubai Marina is one of the world's largest man-made marinas, lined with gleaming skyscrapers, luxury yachts, and a vibrant waterfront promenade. The district attracts a young, cosmopolitan crowd and is consistently among Dubai's top rental markets. Excellent metro and tram connectivity, proximity to Jumeirah Beach Residence (JBR), and a thriving dining scene make Dubai Marina one of the most liquid real estate markets in the city — properties here rarely stay vacant.",
                'hero_image_url'    => 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
                'latitude'          => 25.0807,
                'longitude'         => 55.1400,
                'long_term_roi'     => '6–8%',
                'short_term_roi'    => '10–12%',
                'appreciation'      => '5–7%',
                'off_plan_discount' => '20%',
                'price_ranges'      => [
                    ['type' => 'Studio', 'min' => 108918,   'max' => 163376],
                    ['type' => '1 Bedroom', 'min' => 231450, 'max' => 1089176],
                    ['type' => '2 Bedrooms', 'min' => 313138, 'max' => 3185840],
                ],
                'meta_title'        => 'Dubai Marina Property Investment | Evoorion',
                'meta_description'  => 'Invest in Dubai Marina — waterfront living with 6–8% long-term yields and strong short-term rental demand. Studios to luxury apartments.',
            ],
            [
                'name'              => 'Emirates Hills',
                'description'       => "Emirates Hills is Dubai's most prestigious gated villa community — often dubbed the Beverly Hills of the Middle East. Set around the Montgomerie Golf Course, it features expansive mansions and custom-built estates on generous plots. The community is home to Dubai's elite: senior executives, diplomats, and business owners. Supply is extremely limited, making it one of the most capital-appreciating communities in the emirate. Privacy, green surroundings, and world-class schools nearby make it the ultimate long-term family investment.",
                'hero_image_url'    => 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80',
                'latitude'          => 25.0680,
                'longitude'         => 55.1620,
                'long_term_roi'     => '3–5%',
                'short_term_roi'    => '5–7%',
                'appreciation'      => '5–8%',
                'off_plan_discount' => null,
                'price_ranges'      => [
                    ['type' => '4 Bedrooms', 'min' => 8000000,  'max' => 18000000],
                    ['type' => '5 Bedrooms', 'min' => 15000000, 'max' => 38000000],
                    ['type' => '6+ Bedrooms', 'min' => 25000000, 'max' => 80000000],
                ],
                'meta_title'        => 'Emirates Hills Luxury Villas | Evoorion',
                'meta_description'  => 'The Beverly Hills of Dubai — ultra-exclusive gated villas in Emirates Hills with golf course views and exceptional capital appreciation.',
            ],
            [
                'name'              => 'Al Barari',
                'description'       => "Al Barari is Dubai's most unique eco-luxury community — 60% of its land is dedicated to botanical gardens, lakes, and natural habitats. The development offers bespoke villas and boutique residences surrounded by lush greenery, far removed from the city's bustle yet just minutes from major highways. Amenities include the award-winning The Farm restaurant, a destination spa, and temperature-controlled pools. Al Barari attracts wellness-conscious buyers and families seeking a resort lifestyle as their permanent home.",
                'hero_image_url'    => 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e1?auto=format&fit=crop&w=1600&q=80',
                'latitude'          => 25.0922,
                'longitude'         => 55.2689,
                'long_term_roi'     => '5–7%',
                'short_term_roi'    => '6–8%',
                'appreciation'      => '5–7%',
                'off_plan_discount' => '15%',
                'price_ranges'      => [
                    ['type' => '3 Bedrooms', 'min' => 3500000, 'max' => 7000000],
                    ['type' => '4 Bedrooms', 'min' => 5500000, 'max' => 12000000],
                    ['type' => '5+ Bedrooms', 'min' => 10000000, 'max' => 30000000],
                ],
                'meta_title'        => 'Al Barari Eco-Luxury Residences | Evoorion',
                'meta_description'  => 'Dubai\'s most exclusive green community — bespoke villas in Al Barari surrounded by botanical gardens, spas, and natural lakes.',
            ],
            [
                'name'              => 'Business Bay',
                'description'       => "Business Bay is Dubai's central business district — a dynamic mixed-use community straddling the Dubai Canal. Packed with sleek skyscrapers, waterfront dining, and creative workspaces, it is the preferred address for ambitious professionals and business owners. Proximity to Downtown Dubai, DIFC, and the Sheikh Zayed Road corridor keeps rental demand consistently high. Investors benefit from competitive entry prices relative to Downtown while enjoying strong occupancy and rental growth.",
                'hero_image_url'    => 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80',
                'latitude'          => 25.1865,
                'longitude'         => 55.2618,
                'long_term_roi'     => '6–8%',
                'short_term_roi'    => '9–12%',
                'appreciation'      => '5–7%',
                'off_plan_discount' => '25%',
                'price_ranges'      => [
                    ['type' => 'Studio', 'min' => 500000,    'max' => 900000],
                    ['type' => '1 Bedroom', 'min' => 850000, 'max' => 2000000],
                    ['type' => '2 Bedrooms', 'min' => 1400000, 'max' => 4000000],
                ],
                'meta_title'        => 'Business Bay Property Investment | Evoorion',
                'meta_description'  => 'Invest in Business Bay — Dubai\'s canal-front business district with 6–8% rental yields, off-plan launches, and easy access to Downtown and DIFC.',
            ],
            [
                'name'              => 'Jumeirah Beach Residence',
                'description'       => "Jumeirah Beach Residence — JBR for short — is Dubai's most popular beachfront community. The Walk at JBR is one of the city's liveliest promenades, lined with restaurants, boutiques, and direct beach access. The area attracts both long-term residents who love the indoor-outdoor lifestyle and holiday renters who come for the beach, The Beach complex, and nearby Bluewaters Island with Ain Dubai. Short-term rental yields at JBR are among the highest in the city.",
                'hero_image_url'    => 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
                'latitude'          => 25.0782,
                'longitude'         => 55.1332,
                'long_term_roi'     => '5–8%',
                'short_term_roi'    => '10–14%',
                'appreciation'      => '5–7%',
                'off_plan_discount' => '15%',
                'price_ranges'      => [
                    ['type' => '1 Bedroom', 'min' => 1200000, 'max' => 2800000],
                    ['type' => '2 Bedrooms', 'min' => 2000000, 'max' => 5000000],
                    ['type' => '3 Bedrooms', 'min' => 3500000, 'max' => 9000000],
                ],
                'meta_title'        => 'JBR Property Investment | Evoorion',
                'meta_description'  => 'Buy on The Walk at JBR — Dubai\'s premier beachfront promenade. Short-term rental yields up to 14% driven by tourism and beach lifestyle.',
            ],
            [
                'name'              => 'DIFC',
                'description'       => "The Dubai International Financial Centre is the Middle East's premier financial hub — home to over 5,000 companies, world-class art galleries, Michelin-starred restaurants, and the Gate Avenue lifestyle district. Residences in DIFC command the city's highest price-per-square-foot for apartments and cater exclusively to the C-suite and finance professional. Ultra-low vacancy rates and a captive tenant pool of senior executives make DIFC one of Dubai's most defensible long-term rental plays.",
                'hero_image_url'    => 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1600&q=80',
                'latitude'          => 25.2110,
                'longitude'         => 55.2796,
                'long_term_roi'     => '5–7%',
                'short_term_roi'    => '7–10%',
                'appreciation'      => '6–8%',
                'off_plan_discount' => '20%',
                'price_ranges'      => [
                    ['type' => '1 Bedroom', 'min' => 1800000, 'max' => 4500000],
                    ['type' => '2 Bedrooms', 'min' => 3200000, 'max' => 8000000],
                    ['type' => 'Penthouse', 'min' => 10000000, 'max' => 35000000],
                ],
                'meta_title'        => 'DIFC Property Investment | Evoorion',
                'meta_description'  => 'Live and invest in DIFC — Dubai\'s financial hub with ultra-low vacancy and 5–7% yields from a captive pool of senior finance professionals.',
            ],
        ];

        foreach ($areas as $data) {
            Area::create([
                'name'              => $data['name'],
                'slug'              => Str::slug($data['name']),
                'description'       => $data['description'],
                'hero_image_url'    => $data['hero_image_url'],
                'latitude'          => $data['latitude'],
                'longitude'         => $data['longitude'],
                'long_term_roi'     => $data['long_term_roi'],
                'short_term_roi'    => $data['short_term_roi'],
                'appreciation'      => $data['appreciation'],
                'off_plan_discount' => $data['off_plan_discount'] ?? null,
                'price_ranges'      => $data['price_ranges'],
                'meta_title'        => $data['meta_title'],
                'meta_description'  => $data['meta_description'],
            ]);
        }
    }
}
