<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\BlogPost;
use App\Models\BlogTag;
use App\Models\Developer;
use App\Models\OperationType;
use App\Models\Property;
use App\Models\Region;
use App\Models\User;
use Illuminate\Database\Seeder;

class RegionSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Create regions ────────────────────────────────────────────────
        $regions = [
            ['code' => 'uae',     'name' => 'UAE',           'flag' => '🇦🇪', 'sort_order' => 1],
            ['code' => 'uk',      'name' => 'United Kingdom', 'flag' => '🇬🇧', 'sort_order' => 2],
            ['code' => 'germany', 'name' => 'Germany',        'flag' => '🇩🇪', 'sort_order' => 3],
            ['code' => 'italy',   'name' => 'Italy',          'flag' => '🇮🇹', 'sort_order' => 4],
            ['code' => 'saudi',   'name' => 'Saudi Arabia',   'flag' => '🇸🇦', 'sort_order' => 5],
        ];

        foreach ($regions as $r) {
            Region::firstOrCreate(['code' => $r['code']], $r);
        }

        $uae     = Region::where('code', 'uae')->first();
        $italy   = Region::where('code', 'italy')->first();
        $germany = Region::where('code', 'germany')->first();
        $uk      = Region::where('code', 'uk')->first();

        // ── 2. Tag all existing UAE content ─────────────────────────────────
        Property::whereNull('region_id')->update(['region_id' => $uae->id]);
        Area::whereNull('region_id')->update(['region_id' => $uae->id]);
        BlogPost::whereNull('region_id')->update(['region_id' => $uae->id]);

        // ── 3. Get or create shared deps ─────────────────────────────────────
        $author = User::where('role', 'super_admin')->first()
                ?? User::first();

        $forSale = OperationType::where('name', 'like', '%Sale%')->first()
                ?? OperationType::first();

        $developer = Developer::firstOrCreate(
            ['name' => 'EVOORION Partners'],
            ['name' => 'EVOORION Partners']
        );

        // ── 4. Italy areas ───────────────────────────────────────────────────
        $italyAreas = [
            [
                'name'          => 'Milan City Centre',
                'slug'          => 'milan-city-centre',
                'status'        => 'active',
                'description'   => 'Milan is Italy\'s financial capital and one of Europe\'s top luxury real estate markets. Prime properties in the Brera, Porta Nuova and CityLife districts command strong capital growth and consistent rental yields driven by the fashion, finance and design industries.',
                'latitude'      => 45.4654,
                'longitude'     => 9.1859,
                'long_term_roi' => '5.2%',
                'appreciation'  => '8.1%',
                'hero_image_url'=> 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=80',
                'region_id'     => $italy->id,
            ],
            [
                'name'          => 'Rome Historic District',
                'slug'          => 'rome-historic-district',
                'status'        => 'active',
                'description'   => 'Investing in Rome\'s historic centre offers unparalleled cultural prestige and solid long-term appreciation. The Parioli, Prati and Trastevere neighbourhoods attract high-net-worth buyers seeking trophy assets in one of the world\'s most iconic cities.',
                'latitude'      => 41.9028,
                'longitude'     => 12.4964,
                'long_term_roi' => '4.8%',
                'appreciation'  => '7.5%',
                'hero_image_url'=> 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=80',
                'region_id'     => $italy->id,
            ],
            [
                'name'          => 'Lake Como Luxury Villas',
                'slug'          => 'lake-como-luxury-villas',
                'status'        => 'active',
                'description'   => 'Lake Como is synonymous with exclusive lakeside living. Centuries-old villas and modern luxury retreats attract an international clientele, making it one of Europe\'s most sought-after second-home destinations with limited supply and enduring demand.',
                'latitude'      => 45.9943,
                'longitude'     => 9.2620,
                'long_term_roi' => '4.5%',
                'appreciation'  => '9.2%',
                'hero_image_url'=> 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=1600&q=80',
                'region_id'     => $italy->id,
            ],
        ];

        $createdItalyAreas = [];
        foreach ($italyAreas as $areaData) {
            $area = Area::firstOrCreate(['slug' => $areaData['slug']], $areaData);
            $createdItalyAreas[] = $area;
        }

        // ── 5. Italy properties ──────────────────────────────────────────────
        if ($forSale) {
            $italyProperties = [
                [
                    'title'              => 'Penthouse in Porta Nuova, Milan',
                    'slug'               => 'penthouse-porta-nuova-milan',
                    'description'        => '<p>An exquisite duplex penthouse in Milan\'s most dynamic neighbourhood. Floor-to-ceiling glazing frames panoramic views of the Unicredit Tower and Expo skyline. Features a private rooftop terrace, home automation and two parking spaces.</p>',
                    'type'               => 'penthouse',
                    'price'              => '3200000',
                    'currency'           => 'EUR',
                    'bedrooms'           => 3,
                    'bathrooms'          => 3,
                    'area_sqft'          => '3800',
                    'status'             => 'available',
                    'is_active'          => true,
                    'is_featured'        => true,
                    'roi_min'            => '4.5',
                    'roi_max'            => '6.0',
                    'operation_type_id'  => $forSale->id,
                    'area_id'            => $createdItalyAreas[0]->id,
                    'developer_id'       => $developer->id,
                    'region_id'          => $italy->id,
                ],
                [
                    'title'              => 'Boutique Apartment in Brera, Milan',
                    'slug'               => 'boutique-apartment-brera-milan',
                    'description'        => '<p>A meticulously renovated apartment in the iconic Brera design district. Original exposed brick walls meet contemporary luxury finishes. Walking distance from the Pinacoteca di Brera and the city\'s finest restaurants.</p>',
                    'type'              => 'apartment',
                    'price'             => '980000',
                    'currency'          => 'EUR',
                    'bedrooms'          => 2,
                    'bathrooms'         => 2,
                    'area_sqft'         => '1400',
                    'status'            => 'available',
                    'is_active'         => true,
                    'is_featured'       => false,
                    'roi_min'           => '4.8',
                    'roi_max'           => '6.2',
                    'operation_type_id' => $forSale->id,
                    'area_id'           => $createdItalyAreas[0]->id,
                    'developer_id'      => $developer->id,
                    'region_id'         => $italy->id,
                ],
                [
                    'title'              => 'Historic Palazzo Apartment in Parioli, Rome',
                    'slug'              => 'historic-palazzo-apartment-parioli-rome',
                    'description'       => '<p>A grand apartment within a fully restored 19th-century palazzo in Rome\'s most prestigious residential quarter. The 4-metre ceilings, hand-painted frescoes and private garden courtyard make this a once-in-a-generation trophy asset.</p>',
                    'type'             => 'apartment',
                    'price'            => '2100000',
                    'currency'         => 'EUR',
                    'bedrooms'         => 4,
                    'bathrooms'        => 3,
                    'area_sqft'        => '3200',
                    'status'           => 'available',
                    'is_active'        => true,
                    'is_featured'      => true,
                    'roi_min'          => '4.2',
                    'roi_max'          => '5.5',
                    'operation_type_id'=> $forSale->id,
                    'area_id'          => $createdItalyAreas[1]->id,
                    'developer_id'     => $developer->id,
                    'region_id'        => $italy->id,
                ],
                [
                    'title'             => 'Grand Lakefront Villa, Lake Como',
                    'slug'             => 'grand-lakefront-villa-lake-como',
                    'description'      => '<p>An extraordinary 19th-century villa sitting directly on the shores of Lake Como. Private dock, infinity pool, manicured botanical gardens and a fully modernised interior retain all the grandeur of the original architecture. A world-class trophy property.</p>',
                    'type'            => 'villa',
                    'price'           => '8500000',
                    'currency'        => 'EUR',
                    'bedrooms'        => 6,
                    'bathrooms'       => 5,
                    'area_sqft'       => '9800',
                    'status'          => 'available',
                    'is_active'       => true,
                    'is_featured'     => true,
                    'roi_min'         => '3.8',
                    'roi_max'         => '5.0',
                    'operation_type_id'=> $forSale->id,
                    'area_id'         => $createdItalyAreas[2]->id,
                    'developer_id'    => $developer->id,
                    'region_id'       => $italy->id,
                ],
            ];

            foreach ($italyProperties as $propData) {
                Property::firstOrCreate(['slug' => $propData['slug']], $propData);
            }
        }

        // ── 6. Italy blog posts ──────────────────────────────────────────────
        if ($author) {
            $italyTag = BlogTag::firstOrCreate(['slug' => 'italy'], ['name' => 'Italy']);
            $europeTag = BlogTag::firstOrCreate(['slug' => 'europe'], ['name' => 'Europe']);
            $investTag = BlogTag::firstOrCreate(['slug' => 'investment'], ['name' => 'Investment']);

            $italyPosts = [
                [
                    'title'              => 'Why Ultra-High-Net-Worth Investors Are Turning to Italian Real Estate',
                    'slug'               => 'uhnw-investors-italian-real-estate',
                    'excerpt'            => 'Italy\'s combination of cultural prestige, strong capital appreciation and a favourable flat-tax regime for new residents has created a perfect storm for luxury real estate investment.',
                    'content'            => '<h2>The Italian Opportunity</h2><p>Italy has long been a destination for discerning buyers seeking beauty, culture and history. But beyond lifestyle, a compelling investment case has emerged. Prime residential yields in Milan\'s Porta Nuova average 5.2%, while Lake Como villas have seen 9.2% capital appreciation over the past three years.</p><h2>Flat-Tax Incentives</h2><p>Italy\'s €100,000 annual flat-tax regime for new residents — regardless of global income — has attracted hundreds of high-net-worth individuals from the Middle East, UK and US. This influx of wealth has further underpinned demand at the top of the market.</p><h2>Where We Invest</h2><p>EVOORION focuses on three core Italian markets: Milan for yield-focused investors, Rome for capital preservation in trophy assets, and Lake Como for the exclusive second-home buyer. Our local partnerships ensure access to off-market opportunities before they reach the broader market.</p>',
                    'status'             => 'published',
                    'published_at'       => now()->subDays(5),
                    'reading_time'       => '4 min',
                    'author_id'          => $author->id,
                    'region_id'          => $italy->id,
                    'featured_image_url' => 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80',
                ],
                [
                    'title'              => 'Milan vs Dubai: Comparing Two Premium Investment Markets',
                    'slug'               => 'milan-vs-dubai-premium-investment-markets',
                    'excerpt'            => 'Two of the world\'s great cosmopolitan cities both offer exceptional real estate opportunities. We break down the numbers, lifestyle, and long-term outlook.',
                    'content'            => '<h2>Two Cities, One Decision</h2><p>For many of our clients, the question is not whether to invest in prime real estate, but where. Dubai and Milan both offer compelling fundamentals — yet they serve different investor objectives.</p><h2>Returns Profile</h2><p>Dubai offers higher short-term rental yields (7–10%) driven by a thriving tourism and expatriate market. Milan\'s yields are more modest (4.5–6%) but are underpinned by deeper residential demand and Europe\'s strongest fashion and finance ecosystem.</p><h2>Capital Growth</h2><p>Both markets have seen strong appreciation. Dubai\'s off-plan segment has delivered 15–25% in select areas; Milan\'s prime has delivered a steadier 7–9% with lower volatility. For clients seeking a truly diversified portfolio, holding assets in both markets offers the best of both worlds.</p>',
                    'status'             => 'published',
                    'published_at'       => now()->subDays(12),
                    'reading_time'       => '5 min',
                    'author_id'          => $author->id,
                    'region_id'          => $italy->id,
                    'featured_image_url' => 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
                ],
            ];

            foreach ($italyPosts as $postData) {
                $post = BlogPost::firstOrCreate(['slug' => $postData['slug']], $postData);
                $post->tags()->syncWithoutDetaching([$italyTag->id, $europeTag->id, $investTag->id]);
            }
        }

        // ── 7. Germany + UK areas (brief) ────────────────────────────────────
        $extraAreas = [
            [
                'name'        => 'Munich Central',
                'slug'        => 'munich-central',
                'status'      => 'active',
                'description' => 'Munich consistently ranks as Germany\'s most expensive and desirable residential market. Strong GDP growth, low unemployment and a thriving tech and automotive sector underpin robust rental demand and appreciation.',
                'latitude'    => 48.1351,
                'longitude'   => 11.5820,
                'long_term_roi'=> '3.8%',
                'appreciation' => '6.4%',
                'hero_image_url'=> 'https://images.unsplash.com/photo-1549893072-4bc678117f45?auto=format&fit=crop&w=1600&q=80',
                'region_id'   => $germany->id,
            ],
            [
                'name'        => 'London Prime Central',
                'slug'        => 'london-prime-central',
                'status'      => 'active',
                'description' => 'Prime Central London remains one of the world\'s most resilient real estate markets. Mayfair, Knightsbridge and Chelsea attract global capital with strong long-term capital preservation and GBP-denominated returns.',
                'latitude'    => 51.5074,
                'longitude'   => -0.1278,
                'long_term_roi'=> '4.1%',
                'appreciation' => '5.8%',
                'hero_image_url'=> 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=80',
                'region_id'   => $uk->id,
            ],
        ];

        foreach ($extraAreas as $areaData) {
            Area::firstOrCreate(['slug' => $areaData['slug']], $areaData);
        }

        $this->command->info('Region seeder complete: ' . count($regions) . ' regions, Italy areas+properties+posts seeded.');
    }
}
