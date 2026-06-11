export type Lang = 'en' | 'ar'

const T = {
  en: {
    // Nav
    home:          'Home',
    investments:   'Investments',
    portfolio:     'Portfolio',
    blog:          'Blog',
    about:         'About',
    contact:       'Contact',
    sign_in:       'Sign In',
    book_call:     'Book Call',
    browse_properties: 'Browse Properties',
    explore_locations: 'Explore Locations',

    // Property card / listings
    beds:          'Beds',
    baths:         'Baths',
    roi:           'ROI',
    view_details:  'View Details',
    save_property: 'Save property',
    remove_saved:  'Remove from saved',
    compare:       'Compare',
    added_to_comparison: 'Added to comparison',
    sqft:          'sq.ft',

    // Status
    available:     'Available',
    sold:          'Sold',
    rented:        'Rented',
    ready:         'Ready',

    // Property types
    villa:         'Villa',
    apartment:     'Apartment',
    penthouse:     'Penthouse',
    townhouse:     'Townhouse',
    commercial:    'Commercial',

    // Filters / search
    search_placeholder: 'Search properties…',
    all_types:     'All Types',
    all_locations: 'All Locations',
    price_range:   'Price Range',
    sort_by:       'Sort',
    clear_filters: 'Clear Filters',
    no_results:    'No properties found.',
    load_more:     'Load More',
    showing:       'Showing',
    of:            'of',
    properties:    'properties',

    // Lead form
    your_name:     'Your Name',
    email_address: 'Email Address',
    phone_number:  'Phone Number',
    budget:        'Investment Budget',
    message:       'Message',
    submit:        'Submit Enquiry',
    submitting:    'Submitting…',
    enquiry_sent:  "Thank you! We'll be in touch shortly.",

    // Compare page
    compare_properties:  'Compare Properties',
    add_to_compare:      'Add to compare',
    no_compare:          'No properties to compare.',
    feature:             'Feature',
    price:               'Price',
    type:                'Type',
    location:            'Location',
    area:                'Area',
    bedrooms:            'Bedrooms',
    bathrooms:           'Bathrooms',
    status:              'Status',
    developer:           'Developer',

    // Contact
    office_address:  'Office Address',
    phone:           'Phone',
    email:           'Email',
    office_hours:    'Office Hours',
    follow_us:       'Follow Us',

    // Misc
    read_more:       'Read More',
    view_all:        'View All',
    back:            'Back',
    loading:         'Loading…',
    saved_properties:'Saved Properties',
    sign_out:        'Sign Out',
    prices_shown_in: 'Prices shown in',
    indicative_rate: 'Indicative rate',
  },

  ar: {
    // Nav
    home:          'الرئيسية',
    investments:   'الاستثمارات',
    portfolio:     'المحفظة',
    blog:          'المدونة',
    about:         'من نحن',
    contact:       'اتصل بنا',
    sign_in:       'تسجيل الدخول',
    book_call:     'احجز مكالمة',
    browse_properties: 'تصفح العقارات',
    explore_locations: 'استكشف المناطق',

    // Property card
    beds:          'غرف',
    baths:         'حمامات',
    roi:           'عائد الاستثمار',
    view_details:  'عرض التفاصيل',
    save_property: 'حفظ العقار',
    remove_saved:  'إزالة من المحفوظات',
    compare:       'مقارنة',
    added_to_comparison: 'أضيف للمقارنة',
    sqft:          'قدم مربع',

    // Status
    available:     'متاح',
    sold:          'مباع',
    rented:        'مؤجر',
    ready:         'جاهز',

    // Property types
    villa:         'فيلا',
    apartment:     'شقة',
    penthouse:     'بنتهاوس',
    townhouse:     'تاون هاوس',
    commercial:    'تجاري',

    // Filters
    search_placeholder: 'البحث عن عقارات…',
    all_types:     'جميع الأنواع',
    all_locations: 'جميع المناطق',
    price_range:   'نطاق السعر',
    sort_by:       'ترتيب',
    clear_filters: 'مسح الفلاتر',
    no_results:    'لا توجد عقارات.',
    load_more:     'تحميل المزيد',
    showing:       'عرض',
    of:            'من',
    properties:    'عقار',

    // Lead form
    your_name:     'الاسم الكامل',
    email_address: 'البريد الإلكتروني',
    phone_number:  'رقم الهاتف',
    budget:        'الميزانية الاستثمارية',
    message:       'رسالة',
    submit:        'إرسال الاستفسار',
    submitting:    'جارٍ الإرسال…',
    enquiry_sent:  'شكراً! سنتواصل معك قريباً.',

    // Compare
    compare_properties: 'مقارنة العقارات',
    add_to_compare:     'أضف للمقارنة',
    no_compare:         'لا توجد عقارات للمقارنة.',
    feature:            'الميزة',
    price:              'السعر',
    type:               'النوع',
    location:           'الموقع',
    area:               'المساحة',
    bedrooms:           'غرف النوم',
    bathrooms:          'الحمامات',
    status:             'الحالة',
    developer:          'المطور',

    // Contact
    office_address:  'عنوان المكتب',
    phone:           'الهاتف',
    email:           'البريد الإلكتروني',
    office_hours:    'ساعات العمل',
    follow_us:       'تابعنا',

    // Misc
    read_more:       'اقرأ المزيد',
    view_all:        'عرض الكل',
    back:            'رجوع',
    loading:         'جارٍ التحميل…',
    saved_properties:'العقارات المحفوظة',
    sign_out:        'تسجيل الخروج',
    prices_shown_in: 'الأسعار بـ',
    indicative_rate: 'سعر استرشادي',
  },
} as const

export type TranslationKey = keyof typeof T.en

export function getTranslations(lang: Lang): Record<TranslationKey, string> {
  return T[lang] as Record<TranslationKey, string>
}
