<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $testimonials = [
            [
                'author_name'  => 'Fatima Al Mansouri',
                'author_title' => 'Investor, Downtown Dubai',
                'quote'        => 'EVOORION handled everything from first viewing to handover flawlessly. Their market knowledge saved me both time and money — exceptional service from start to finish.',
                'rating'       => 5,
                'sort_order'   => 1,
            ],
            [
                'author_name'  => 'James Whitfield',
                'author_title' => 'Portfolio Investor, London',
                'quote'        => 'As an overseas investor, I needed a team I could trust completely. EVOORION managed the entire purchase remotely — legal, banking, registration — and my Palm Jumeirah villa was rented within two weeks of handover.',
                'rating'       => 5,
                'sort_order'   => 2,
            ],
            [
                'author_name'  => 'Elena Petrova',
                'author_title' => 'Second-Home Buyer, Moscow',
                'quote'        => 'The team understood exactly what we were looking for and showed us only properties that matched. No pressure, honest advice on every option, and a negotiation that got us below asking price.',
                'rating'       => 5,
                'sort_order'   => 3,
            ],
            [
                'author_name'  => 'Marco Bellini',
                'author_title' => 'Investor, Milan',
                'quote'        => 'I compared several Dubai agencies before choosing EVOORION. Their ROI analysis on off-plan projects was the most rigorous I saw — and eighteen months later the numbers have proven them right.',
                'rating'       => 5,
                'sort_order'   => 4,
            ],
            [
                'author_name'  => 'Sarah & Daniel Okafor',
                'author_title' => 'First-Time Buyers, Abu Dhabi',
                'quote'        => 'Buying our first property felt daunting until EVOORION walked us through every step. They answered every question patiently and were reachable on WhatsApp whenever we needed them.',
                'rating'       => 5,
                'sort_order'   => 5,
            ],
            [
                'author_name'  => 'Khalid Rahman',
                'author_title' => 'Landlord, Dubai Marina',
                'quote'        => 'Three purchases with EVOORION so far and their property management keeps my units occupied year-round. Transparent reporting, fast maintenance, zero headaches.',
                'rating'       => 5,
                'sort_order'   => 6,
            ],
        ];

        foreach ($testimonials as $t) {
            Testimonial::updateOrCreate(
                ['author_name' => $t['author_name']],
                $t + ['is_active' => true],
            );
        }
    }
}
