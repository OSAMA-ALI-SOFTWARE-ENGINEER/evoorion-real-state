<?php

namespace Database\Seeders;

use App\Models\PageContent;
use Illuminate\Database\Seeder;

class PageContentSeeder extends Seeder
{
    public function run(): void
    {
        $pages = $this->data();

        foreach ($pages as $slug => $sections) {
            foreach ($sections as $key => $content) {
                PageContent::updateOrCreate(
                    ['page_slug' => $slug, 'section_key' => $key],
                    ['content'   => $content],
                );
            }
        }
    }

    private function data(): array
    {
        return [

            // ── HOME ──────────────────────────────────────────────────────────

            'home' => [

                'hero_eyebrow' => 'Luxury Real Estate Investment',

                'hero_headline_line1' => 'Invest in Dubai.',
                'hero_headline_line2' => 'Secure Your Legacy.',

                'hero_subtext' => 'Exclusive off-market opportunities. High returns. Full-service investment advisory.',

                'hero_cta_primary'   => 'Explore Opportunities',
                'hero_cta_secondary' => 'Book Private Call',

                'hero_stats' => [
                    ['value' => '500+',   'label' => 'Properties Sold'],
                    ['value' => 'AED 2B+','label' => 'Transactions'],
                    ['value' => '98%',    'label' => 'Client Satisfaction'],
                ],

                'trust_strip_label'    => 'Trusted by Leading Developers',
                'trust_strip_developers' => [
                    'EMAAR', 'DAMAC', 'SOBHA REALTY', 'NAKHEEL', 'MERAAS', 'SELECT GROUP',
                ],

                'what_we_do_eyebrow'   => 'What We Do',
                'what_we_do_headline'  => "Strategic Investments.\nTailored for You.",
                'what_we_do_body'      => 'EVOORION is a Dubai-based luxury real estate investment firm dedicated to helping high-net-worth individuals build and grow their real estate portfolios with confidence and precision.',

                'what_we_do_services' => [
                    [
                        'title'       => 'Off-Plan Investments',
                        'description' => "Access pre-launch opportunities from Dubai's most prestigious developers. Secure units at pre-market pricing with flexible payment plans and exceptional capital appreciation potential.",
                    ],
                    [
                        'title'       => 'Ready Properties',
                        'description' => 'Immediate rental income from handpicked ready-to-occupy villas, apartments, and penthouses in Dubai\'s most sought-after communities — delivering 8–12% annual rental yields.',
                    ],
                    [
                        'title'       => 'Private Advisory',
                        'description' => 'End-to-end investment management: market intelligence, legal structuring, property management, and portfolio optimisation — all handled by our expert team.',
                    ],
                ],

                'why_dubai_eyebrow'   => 'Why Dubai',
                'why_dubai_headline'  => "The World's Premier\nInvestment Destination",

                'why_dubai_stats' => [
                    ['value' => '0%',    'label' => 'Property Tax',        'description' => 'No capital gains or property tax makes Dubai the most tax-efficient real estate market globally.'],
                    ['value' => '8–12%', 'label' => 'Rental Yield',        'description' => 'Among the highest net rental yields of any global prime city, consistently outperforming London and New York.'],
                    ['value' => '100%',  'label' => 'Foreign Ownership',   'description' => 'Designated freehold zones allow full foreign ownership with no restrictions on repatriation of funds.'],
                    ['value' => '#1',    'label' => 'Global Destination',  'description' => "Dubai ranks as the world's most visited city and a top destination for HNWI relocation."],
                ],

                'our_process_eyebrow'  => 'The Process',
                'our_process_headline' => "A Seamless\nInvestment Journey",

                'our_process_steps' => [
                    ['number' => '01', 'title' => 'Discover', 'description' => 'We conduct a thorough discovery session to understand your investment goals, risk profile, and preferences.'],
                    ['number' => '02', 'title' => 'Select',   'description' => 'Our advisors curate a bespoke shortlist of off-market and listed properties matched to your criteria.'],
                    ['number' => '03', 'title' => 'Acquire',  'description' => 'We handle negotiations, legal due diligence, SPA drafting, and DLD registration — end to end.'],
                    ['number' => '04', 'title' => 'Manage',   'description' => 'Post-acquisition, our team ensures your asset is tenanted, managed, and optimised for maximum yield.'],
                ],

                'cta_eyebrow'   => 'Get Started',
                'cta_headline'  => "Ready to Build Your\nDubai Real Estate Portfolio?",
                'cta_body'      => 'Book a private consultation with our experts. No pressure, no obligations — just personalised investment intelligence.',
                'cta_button'    => 'Book Private Consultation',
            ],

            // ── ABOUT ─────────────────────────────────────────────────────────

            'about' => [

                'hero_eyebrow'       => 'Our Story',
                'hero_headline_line1'=> 'Built on Trust.',
                'hero_headline_line2'=> 'Driven by Results.',
                'hero_body'          => 'EVOORION was founded on a singular conviction: that investing in Dubai real estate should be as effortless as it is rewarding. We exist to bridge the gap between world-class properties and the discerning investors who deserve them.',

                'story_headline' => 'Our Story',
                'story_body'     => "EVOORION was established by a team of seasoned real estate professionals who recognised a growing disconnect between the pace of Dubai's property market and the quality of guidance available to international investors.\n\nWe set out to build an advisory firm that combined institutional-grade market intelligence with personalised, relationship-first service — one that would treat every client's capital with the same respect we would our own.\n\nToday, EVOORION serves a global clientele of high-net-worth individuals, family offices, and corporate investors, managing some of the most prestigious property portfolios in the UAE.",

                'story_stats' => [
                    ['value' => '500+',    'label' => 'Properties Sold'],
                    ['value' => 'AED 2B+', 'label' => 'Transaction Volume'],
                    ['value' => '98%',     'label' => 'Client Satisfaction'],
                    ['value' => '15+',     'label' => 'Developer Partnerships'],
                ],

                'mission_quote'  => "Our mission is to make Dubai's most exceptional real estate accessible to every investor who dreams of building a lasting legacy — regardless of where in the world they call home.",
                'mission_byline' => 'The EVOORION Team',

                'differentiators_eyebrow'  => 'Why EVOORION',
                'differentiators_headline' => 'What Sets Us Apart',

                'differentiators' => [
                    [
                        'title'       => 'Exclusive Access',
                        'description' => "Direct partnerships with Dubai's leading developers give our clients access to pre-launch allocations and off-market properties unavailable to the general public.",
                    ],
                    [
                        'title'       => 'Expert Advisory',
                        'description' => "Our team of certified real estate advisors brings decades of combined experience in Dubai's luxury property market, with deep knowledge of every micro-location.",
                    ],
                    [
                        'title'       => 'End-to-End Support',
                        'description' => 'From initial consultation and property selection through legal completion, handover, and ongoing management — we handle every detail seamlessly.',
                    ],
                    [
                        'title'       => 'Proven Track Record',
                        'description' => "Over AED 2 billion in completed transactions, 500+ satisfied clients, and a portfolio spanning Dubai's most prestigious communities since our founding.",
                    ],
                ],

                'cta_headline' => "Let's Build Your Portfolio Together",
                'cta_body'     => 'Schedule a confidential conversation with one of our senior investment advisors.',
                'cta_button'   => 'Get in Touch',
            ],

            // ── CONTACT ───────────────────────────────────────────────────────

            'contact' => [

                'hero_eyebrow'  => 'Get in Touch',
                'hero_headline' => 'Start Your Conversation',
                'hero_body'     => 'Our senior advisors are available for private consultations — in person, by phone, or via video call, wherever you are in the world.',

                'form_title'    => 'Book a Private Consultation',
                'form_subtitle' => 'Complete the form and an advisor will be in touch within 2 hours during office hours.',

                'meta_title'       => 'Contact Us',
                'meta_description' => "Get in touch with EVOORION's investment advisors. Book a private consultation or send an enquiry.",
            ],

            // ── INVESTMENTS ───────────────────────────────────────────────────

            'investments' => [

                'hero_eyebrow'  => 'Opportunities',
                'hero_headline' => 'Investment Pathways',
                'hero_body'     => 'Three proven strategies to build, grow, and secure your Dubai real estate portfolio — each tailored to your investment horizon and lifestyle goals.',

                'investment_types' => [
                    [
                        'title'       => 'Off-Plan Investments',
                        'badge'       => 'HIGH APPRECIATION',
                        'description' => "Gain exclusive access to pre-launch opportunities from Dubai's most prestigious developers. Secure units at pre-market pricing with structured payment plans extending over construction periods.",
                        'highlights'  => [
                            'Pre-market pricing advantage',
                            'Flexible payment plans (post-handover)',
                            'Capital appreciation of 20–40%',
                            'Managed by top-tier developers',
                        ],
                        'cta' => 'Explore Off-Plan',
                    ],
                    [
                        'title'       => 'Ready Properties',
                        'badge'       => 'IMMEDIATE INCOME',
                        'description' => "Acquire fully finished, tenanted or vacant luxury residences generating immediate rental income across Dubai's most in-demand neighbourhoods — from the Marina to Palm Jumeirah.",
                        'highlights'  => [
                            '8–12% annual rental yield',
                            'Immediate cash flow from day one',
                            'Full property management available',
                            'Short & long-term rental strategies',
                        ],
                        'cta' => 'Browse Ready Properties',
                    ],
                    [
                        'title'       => 'Private Advisory',
                        'badge'       => 'FULL-SERVICE SUPPORT',
                        'description' => 'For high-net-worth individuals seeking a completely hands-off investment experience. From market intelligence and property selection to legal structuring and asset management — we handle everything.',
                        'highlights'  => [
                            'Dedicated investment advisor',
                            'Legal structuring & DLD registration',
                            'Portfolio diversification strategy',
                            'Ongoing asset optimisation',
                        ],
                        'cta' => 'Book Advisory Call',
                    ],
                ],

                'form_headline' => 'Start Your Investment Journey',
                'form_body'     => 'Our advisors will reach out within 24 hours.',

                'meta_title'       => 'Investment Opportunities',
                'meta_description' => 'Explore off-plan investments, ready properties, and private advisory services for Dubai real estate.',
            ],

            // ── OFF-PLAN ──────────────────────────────────────────────────────

            'off-plan' => [

                'hero_eyebrow'         => 'New Developments',
                'hero_headline_prefix' => "Own Dubai's",
                'hero_headline_gold'   => 'Future Skyline',
                'hero_headline_suffix' => 'First',
                'hero_subtext'         => "Pre-launch access to Dubai's most anticipated new developments. Entry pricing, structured payment plans, and capital appreciation that begins the moment you sign — before a single brick is laid.",
                'hero_cta_primary'     => 'View Developments',
                'hero_cta_secondary'   => 'Book Private Briefing',

                'benefits_eyebrow'  => 'Why Off-Plan',
                'benefits_headline' => 'The Off-Plan Advantage',

                'developments_eyebrow'  => 'Portfolio',
                'developments_headline' => 'Current Developments',

                'process_eyebrow'  => 'The Process',
                'process_headline' => 'How It Works',

                'cta_eyebrow'  => 'Get Started',
                'cta_headline' => 'Reserve Your Off-Plan Unit',
                'cta_body'     => "Speak with a dedicated off-plan advisor. We'll match you with the right development based on your budget, timeline, and investment goals — and guide you from reservation through to handover.",

                'form_title'    => 'Book an Off-Plan Briefing',
                'form_subtitle' => 'An advisor will contact you within 2 hours during office hours.',

                'meta_title'       => 'Off-Plan Properties Dubai | New Developments | EVOORION',
                'meta_description' => "Invest in Dubai's most anticipated new developments. Pre-launch pricing, flexible payment plans, and 20–40% capital appreciation during construction.",
            ],

            // ── SELL ──────────────────────────────────────────────────────────

            'sell' => [

                'hero_eyebrow'         => 'Sell with Confidence',
                'hero_headline_prefix' => 'List Your Property',
                'hero_headline_gold'   => 'With EVOORION',
                'hero_subtext'         => 'Get a free valuation, professional marketing, and access to our exclusive network of 4,800+ qualified buyers — all with zero upfront fees.',
                'hero_cta'             => 'Get Free Valuation',

                'process_eyebrow'  => 'The Process',
                'process_headline' => 'How We Sell Your Property',

                'inclusions_eyebrow'  => 'Full Service',
                'inclusions_headline' => 'Everything Included',

                'form_eyebrow'  => 'Get Started',
                'form_headline' => 'Request Your Free Valuation',
                'form_body'     => 'Leave your details and a senior agent will contact you within 24 hours.',

                'meta_title'       => 'Sell Your Property in Dubai | List With Us | EVOORION',
                'meta_description' => 'List your Dubai property with EVOORION and reach thousands of qualified buyers. Free valuation, professional photography, and full-service representation.',
            ],

            // ── AGENTS ────────────────────────────────────────────────────────

            'agents' => [

                'hero_eyebrow'         => 'Our Team',
                'hero_headline_prefix' => 'Expert Property',
                'hero_headline_gold'   => 'Advisors',
                'hero_subtext'         => 'Licensed, market-tested professionals committed to finding your perfect Dubai property investment.',

                'empty_state_text' => 'Our team profiles are coming soon.',

                'cta_eyebrow'  => 'Work With Us',
                'cta_headline' => 'Speak to an Agent',
                'cta_body'     => "Tell us what you're looking for and we'll match you with the right advisor.",

                'meta_title'       => 'Our Agents | Expert Dubai Property Advisors | EVOORION',
                'meta_description' => 'Meet our team of licensed Dubai property advisors. Each agent brings deep market knowledge and a dedicated commitment to finding your perfect investment.',
            ],

            // ── SERVICES ──────────────────────────────────────────────────────

            'services' => [

                'hero_eyebrow'         => 'What We Offer',
                'hero_headline_prefix' => 'Full-Spectrum',
                'hero_headline_gold'   => 'Real Estate Services',
                'hero_subtext'         => 'From your first property search to long-term portfolio management, EVOORION provides every service you need to invest with confidence in Dubai.',

                'cta_eyebrow'  => 'Get in Touch',
                'cta_headline' => 'How Can We Help You?',
                'cta_body'     => 'Tell us which service you need and a dedicated advisor will be in touch within 24 hours.',

                'meta_title'       => 'Our Services | Dubai Real Estate Advisory | EVOORION',
                'meta_description' => 'Comprehensive real estate services in Dubai — buy, sell, rent, property management, investment advisory, and legal support.',
            ],

            // ── PROPERTY MANAGEMENT ───────────────────────────────────────────

            'property-management' => [

                'hero_eyebrow'         => 'Passive Income, Perfected',
                'hero_headline_prefix' => 'Property Management',
                'hero_headline_gold'   => 'Done Right',
                'hero_subtext'         => 'We take care of everything — tenants, maintenance, rent, and compliance — so your Dubai investment earns passively while you focus on what matters.',
                'hero_cta'             => 'Get a Free Quote',

                'features_eyebrow'  => 'What We Handle',
                'features_headline' => 'Everything, End to End',

                'inclusions_eyebrow'  => 'All-Inclusive',
                'inclusions_headline' => 'No Hidden Extras',
                'inclusions_body'     => 'Our flat 5% management fee covers everything listed below — no surprise charges.',

                'form_eyebrow'  => 'Free Quote',
                'form_headline' => 'Hand Over the Keys',
                'form_body'     => "Tell us about your property and we'll prepare a tailored management proposal.",

                'meta_title'       => 'Property Management Dubai | Hassle-Free Rental Management | EVOORION',
                'meta_description' => 'Professional property management in Dubai. Tenant sourcing, rent collection, maintenance coordination, and financial reporting — all handled for you.',
            ],

        ];
    }
}
