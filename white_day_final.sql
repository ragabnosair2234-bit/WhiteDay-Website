CREATE DATABASE white_day;

USE white_day;

CREATE TABLE platform_contact
(
    contact_id INT PRIMARY KEY,
    platform_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20)  NOT NULL,
    email VARCHAR(100) NOT NULL
);

CREATE TABLE users 
(
    user_id INT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100)UNIQUE NOT NULL,
    phone VARCHAR(20)NOT NULL,
    password VARCHAR(255)NOT NULL,
    role VARCHAR(20)NOT NULL
);

CREATE TABLE service_type
(
    t_id INT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL
);

CREATE TABLE service
(
    service_id INT PRIMARY KEY,
    s_name VARCHAR(150)NOT NULL,
    description TEXT,
    media_files VARCHAR(255),
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(100),              
    price DECIMAL(12,2) NOT NULL,   
    city VARCHAR(50),
    location VARCHAR(100),
    avg_rating DECIMAL(3,1) DEFAULT 0.0,
    review_count INT DEFAULT 0,
    user_id INT NOT NULL,
    t_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (t_id) REFERENCES service_type(t_id)
);


CREATE TABLE service_detail
(
    detail_id  INT PRIMARY KEY,
    service_id INT NOT NULL,
    detail_key VARCHAR(100) NOT NULL,
    detail_val VARCHAR(255) NOT NULL,
    FOREIGN KEY (service_id) REFERENCES service(service_id)
);


CREATE TABLE booking
(
    booking_id INT PRIMARY KEY,
    status VARCHAR(20) NOT NULL,
    booking_date DATE NOT NULL,
    delivery_date DATE,
    total_amount DECIMAL(12,2) NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);


CREATE TABLE booking_includes
(
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (booking_id,service_id),
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id),
    FOREIGN KEY (service_id) REFERENCES service(service_id)
);


CREATE TABLE wallet_payment
(
    transaction_id INT PRIMARY KEY,
    payment_method VARCHAR(20) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    commission DECIMAL(12,2)  NOT NULL,
    balance_after DECIMAL(12,2),
    payment_date DATE NOT NULL,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);


CREATE TABLE review 
(
    review_id INT PRIMARY KEY,
    rate_star DECIMAL(3,1) NOT NULL,
    comment TEXT,
    created_at DATE NOT NULL,
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (service_id) REFERENCES service(service_id)
);


CREATE TABLE dispute 
(
    dispute_id INT PRIMARY KEY,
    issue_description TEXT NOT NULL,
    manager_decision VARCHAR(50),
    created_at DATE NOT NULL,
    user_id INT NOT NULL,
    booking_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id)
);


INSERT INTO platform_contact (contact_id, platform_name, phone, email) VALUES
(1, 'White Day Wedding Planner', '01272017621', 'Whitedayweddingplanner@gmail.com');


INSERT INTO users (user_id, first_name, last_name, email, phone, password, role) VALUES

(1,'Omar','Kamal','omar.admin@whiteday.com','01000000001','hashed_admin01','admin'),
(2,'Ahmed','Ali','ahmed.ali@gmail.com','01100000001','hashed_cust01','customer'),
(3,'Mona','Zaki','mona.zaki@gmail.com','01100000002','hashed_cust02','customer'),
(4,'Nour','Hassan','nour.hassan@gmail.com','01100000003','hashed_cust03','customer'),
(5,'Kareem','Fawzy','kareem.fawzy@gmail.com','01100000004','hashed_cust04','customer'),
(6,  'Rixos','Venue','rixos@halls.com','01011100001','hashed_prov01','provider'),
(7,  'Arkan','Venue','arkan@halls.com','01011100002', 'hashed_prov02','provider'),
(8,  'Cinderella','Venue','cinderella@halls.com','01011100003', 'hashed_prov03','provider'),
(9,  'Askar','Venue','askar@halls.com','01011100004','hashed_prov04','provider'),
(10, 'Crystal','Venue','crystal@halls.com','01011100005','hashed_prov05','provider'),
(11, 'Lavender','Venue','lavender@halls.com','01011100006','hashed_prov06','provider'),
(12, 'Royal','Venue','royal@halls.com','01011100007','hashed_prov07','provider'),
(13, 'Rose','Venue','rose@halls.com','01011100008','hashed_prov08','provider'),

-- Makeup Artists
(14, 'Sara',      'Salama',     'sara.salama@makeup.com',          '01200000001', 'hashed_prov09',   'provider'),
(15, 'Yasmin',    'Ahmed',      'yasmin.ahmed@makeup.com',         '01200000002', 'hashed_prov10',   'provider'),
(16, 'Hend',      'Mohamed',    'hend.mohamed@makeup.com',         '01200000003', 'hashed_prov11',   'provider'),
(17, 'Esraa',     'Mohamed',    'esraa.mohamed@makeup.com',        '01200000004', 'hashed_prov12',   'provider'),
(18, 'Rana',      'Fathy',      'rana.fathy@makeup.com',           '01200000005', 'hashed_prov13',   'provider'),
(19, 'Sohila',    'Ahmed',      'sohila.ahmed@makeup.com',         '01200000006', 'hashed_prov14',   'provider'),

-- Dress & Suit Store
(20, 'White',     'Dresses',    'dresses@whiteday.com',            '01300000001', 'hashed_prov15',   'provider'),
(21, 'White',     'Suits',      'suits@whiteday.com',              '01300000002', 'hashed_prov16',   'provider'),

--  Photographers
(22, 'Agha',      'Wedding',    'agha@photo.com',                  '01400000001', 'hashed_prov17',   'provider'),
(23, 'Dart',      'Wedding',    'dart@photo.com',                  '01400000002', 'hashed_prov18',   'provider'),
(24, 'Aboutaleb', 'Wedding',    'aboutaleb@photo.com',             '01400000003', 'hashed_prov19',   'provider'),
(25, 'Omar',      'Ahmed',      'omar.photo@photo.com',            '01400000004', 'hashed_prov20',   'provider'),
(26, 'Wael',      'Ameen',      'wael.ameen@photo.com',            '01400000005', 'hashed_prov21',   'provider'),
(27, 'Youssef',   'Ali',        'youssef.ali@photo.com',           '01400000006', 'hashed_prov22',   'provider'),

-- Providers — Cars
(28, 'Dream',     'Cars',       'cars@whiteday.com',               '01500000001', 'hashed_prov23',   'provider'),

-- Artists & Singers
(29, 'Bahaa',     'Sultan',     'bahaa@artists.com',               '01600000001', 'hashed_prov24',   'provider'),
(30, 'Mahmoud',   'AlLaithi',   'mahmoud@artists.com',             '01600000002', 'hashed_prov25',   'provider'),
(31, 'Tamer',     'Hosny',      'tamer@artists.com',               '01600000003', 'hashed_prov26',   'provider'),
(32, 'Amr',       'Diab',       'amr@artists.com',                 '01600000004', 'hashed_prov27',   'provider'),

--  Barber Shop & Extra Services
(33, 'White',     'BarberShop', 'barber@whiteday.com',             '01700000001', 'hashed_prov28',   'provider'),
(34, 'White',     'Extras',     'extras@whiteday.com',             '01800000001', 'hashed_prov29',   'provider');


INSERT INTO service_type (t_id, service_name) VALUES
(1,  'Wedding Hall'),
(2,  'Wedding Dress'),
(3,  'Suit Store'),
(4,  'Makeup Artist'),
(5,  'Photographer'),
(6,  'Catering'),
(7,  'Cars'),
(8,  'Artists & Singers'),
(9,  'Emergency Bag'),
(10, 'Bridesmaid'),
(11, 'Extra Services'),
(12, 'Barber Shop');


INSERT INTO service
  (service_id, s_name, description, media_files,
   contact_phone,    contact_email,
   price,   city,             location,
   avg_rating, review_count, user_id, t_id)
VALUES

-- ── WEDDING HALLS ──────────────────────────────────────────────────────────
(1,  'Rixos Plaza Wedding Hall',
     'Elegant hall perfect for large celebrations with modern decorations, professional lighting, and a spacious dance floor.',
     'rixos_01.jpg',       '01011100001', 'rixos@halls.com',
     20000.00, 'Cairo',           'Maadi',            4.8, 120,  6, 1),

(2,  'Arkan Wedding Hall',
     'Stylish spacious venue offering premium services, a perfect atmosphere, and exceptional comfort.',
     'arkan_01.jpg',       '01011100002', 'arkan@halls.com',
     25000.00, 'Cairo',           'Dokki',            5.1, 100,  7, 1),

(3,  'Cinderella Wedding Hall',
     'Modern elegant venue designed for unforgettable celebrations with a warm welcoming atmosphere.',
     'cinderella_01.jpg',  '01011100003', 'cinderella@halls.com',
     23000.00, '10th of Ramadan', 'Al Safwa Club',    4.9, 130,  8, 1),

(4,  'Askar Wedding Hall',
     'Luxurious hall crafted to host your most special moments combining high-quality services.',
     'askar_01.jpg',       '01011100004', 'askar@halls.com',
     90000.00, 'Cairo',           'New Cairo',        5.2, 200,  9, 1),

(5,  'Crystal Wedding Hall',
     'A sparkling crystal-themed hall delivering a magical wedding experience.',
     'crystal_01.jpg',     '01011100005', 'crystal@halls.com',
     10000.00, 'Cairo',           'Nasr City',        4.7,  90, 10, 1),

(6,  'Lavender Wedding Hall',
     'Soft lavender-toned hall offering an elegant and relaxing ceremony atmosphere.',
     'lavender_01.jpg',    '01011100006', 'lavender@halls.com',
     13000.00, 'Cairo',           'Heliopolis',       4.8,  85, 11, 1),

(7,  'Royal Wedding Hall',
     'A royal-inspired venue with grand decor for a truly regal celebration.',
     'royal_01.jpg',       '01011100007', 'royal@halls.com',
     12000.00, 'Cairo',           'Zamalek',          4.9,  95, 12, 1),

(8,  'Rose Wedding Hall',
     'A romantic rose-themed hall perfect for intimate weddings.',
     'rose_01.jpg',        '01011100008', 'rose@halls.com',
     16000.00, 'Giza',            'Mohandessin',      4.8,  80, 13, 1),

-- ── MAKEUP ARTISTS ─────────────────────────────────────────────────────────
(9,  'Sara Salama',
     'Professional makeup artist based in Cairo specializing in elegant long-lasting bridal makeup.',
     'sara_01.jpg',        '01200000001', 'sara.salama@makeup.com',
      5500.00, 'Cairo',           'Maadi',            4.9, 110, 14, 4),

(10, 'Yasmin Ahmed',
     'Skilled makeup artist creating flawless personalized looks for weddings and special occasions.',
     'yasmin_01.jpg',      '01200000002', 'yasmin.ahmed@makeup.com',
      6500.00, 'Cairo',           'Nasr City',        4.8, 120, 15, 4),

(11, 'Hend Mohamed',
     'Combines creativity, skill, and high-quality products to craft looks that make every bride radiant.',
     'hend_01.jpg',        '01200000003', 'hend.mohamed@makeup.com',
      7000.00, 'Giza',            'Dokki',            5.1, 100, 16, 4),

(12, 'Esraa Mohamed',
     'Expert bridal artist offering full makeup and hairstyling for weddings and events.',
     'esraa_01.jpg',       '01200000004', 'esraa.mohamed@makeup.com',
      8000.00, 'Cairo',           'Heliopolis',       5.0,  90, 17, 4),

(13, 'Rana Fathy',
     'Talented makeup artist with a delicate touch for brides and special events.',
     'rana_01.jpg',        '01200000005', 'rana.fathy@makeup.com',
      7500.00, 'Cairo',           'Zamalek',          4.9,  85, 18, 4),

(14, 'Sohila Ahmed',
     'High-end bridal makeup specialist focused on natural elegance.',
     'sohila_01.jpg',      '01200000006', 'sohila.ahmed@makeup.com',
      8500.00, 'Giza',            '6th October',      5.0,  75, 19, 4),

-- ── WEDDING DRESSES ────────────────────────────────────────────────────────
(15, 'Royal Dream Wedding Dress',
     'Elegant lace and tulle dress with delicate details, perfect for a romantic and classic look.',
     'royaldream_01.jpg',  '01300000001', 'dresses@whiteday.com',
     10000.00, 'Cairo',           'Maadi',            4.8,  80, 20, 2),

(16, 'Golden Queen Engagement Dress',
     'Soft elegant dress with a romantic touch, perfect for an engagement or a classy occasion.',
     'goldenqueen_01.jpg', '01300000001', 'dresses@whiteday.com',
     15000.00, 'Cairo',           'Nasr City',        4.9,  90, 20, 2),

(17, 'Moonlight Wedding Dress',
     'Bridal dress perfect for Katb Kitab — elegant, soft, and designed for a simple yet classy look.',
     'moonlight_01.jpg',   '01300000001', 'dresses@whiteday.com',
     17000.00, 'Giza',            'Mohandessin',      4.9,  75, 20, 2),

(18, 'Diamond Glow Soiree Dress',
     'Soft elegant dress for engagements or special wedding moments with romantic style and delicate details.',
     'diamondglow_01.jpg', '01300000001', 'dresses@whiteday.com',
     11500.00, 'Cairo',           'Zamalek',          4.6, 100, 20, 2),

(19, 'Lavender Dream Dress',
     'A minimalist flowing dress for the modern bride.',
     'lavenderdream_01.jpg','01300000001','dresses@whiteday.com',
      9000.00, 'Cairo',           'Heliopolis',       4.7,  70, 20, 2),

(20, 'Sweet Girl Dress',
     'A stunning embellished gown with lace details and a V-neck.',
     'sweetgirl_01.jpg',   '01300000001', 'dresses@whiteday.com',
     12000.00, 'Cairo',           'Nasr City',        4.8,  65, 20, 2),

(21, 'Cherry Glow Dress',
     'A modest high-neck bridal dress with 3D floral sleeves.',
     'cherryglow_01.jpg',  '01300000001', 'dresses@whiteday.com',
     14000.00, 'Giza',            'Dokki',            4.8,  60, 20, 2),

(22, 'Elite Dress',
     'A luxurious lace mermaid gown for a bold bridal statement.',
     'elite_01.jpg',       '01300000001', 'dresses@whiteday.com',
     16500.00, 'Cairo',           'Maadi',            4.9,  55, 20, 2),

-- ── SUITS ──────────────────────────────────────────────────────────────────
(23, 'Royal Black Wedding Suit',
     'Combines elegance and absolute luxury — 3-piece black suit for an unforgettable wedding day presence.',
     'royalblack_01.jpg',  '01300000002', 'suits@whiteday.com',
     12500.00, 'Cairo',           'Zamalek',          4.8,  80, 21, 3),

(24, 'Noble White Wedding Suit',
     'White wedding suit for the groom, perfect for a timeless and sophisticated look.',
     'noblewhite_01.jpg',  '01300000002', 'suits@whiteday.com',
     11500.00, 'Cairo',           'Nasr City',        4.7,  90, 21, 3),

(25, 'Shadow Royal Wedding Suit',
     'Black 2-piece suit combining timeless elegance with modern sophistication.',
     'shadowroyal_01.jpg', '01300000002', 'suits@whiteday.com',
     13500.00, 'Cairo',           'Heliopolis',       4.9,  99, 21, 3),

(26, 'Velet Burgundy Wedding Suit',
     'Sleek burgundy velvet suit designed to exude confidence, elegance, and charm.',
     'velvet_01.jpg',      '01300000002', 'suits@whiteday.com',
     12500.00, 'Cairo',           'Maadi',            4.6,  75, 21, 3),

-- ── PHOTOGRAPHERS ──────────────────────────────────────────────────────────
(27, 'Agha Wedding Photography',
     'Professional photography service specialized in capturing wedding ceremonies and bridal events.',
     'agha_01.jpg',        '01400000001', 'agha@photo.com',
      3000.00, 'Cairo',           'Maadi',            4.7, 102, 22, 5),

(28, 'Dart Wedding Photography',
     'Wedding photographer capturing your most special moments and memories.',
     'dart_01.jpg',        '01400000002', 'dart@photo.com',
     12000.00, 'Giza',            'Mohandessin',      4.9, 110, 23, 5),

(29, 'Aboutaleb Wedding Photography',
     'Specializes in wedding photography, capturing love, laughter, and all unforgettable moments.',
     'aboutaleb_01.jpg',   '01400000003', 'aboutaleb@photo.com',
     15000.00, 'Cairo',           'Nasr City',        5.1, 120, 24, 5),

(30, 'Omar Ahmed Photography',
     'Creative wedding photographer with a passion for natural storytelling.',
     'omarphoto_01.jpg',   '01400000004', 'omar.photo@photo.com',
      4500.00, 'Cairo',           'Heliopolis',       4.8,  80, 25, 5),

(31, 'Wael Ameen Photography',
     'Affordable wedding photographer delivering warm, natural shots.',
     'wael_01.jpg',        '01400000005', 'wael.ameen@photo.com',
      2500.00, 'Cairo',           'Maadi',            4.6,  95, 26, 5),

(32, 'Youssef Ali Photography',
     'Detail-oriented photographer capturing the emotion of every wedding moment.',
     'youssef_01.jpg',     '01400000006', 'youssef.ali@photo.com',
      4500.00, 'Giza',            'Dokki',            4.8,  88, 27, 5),

-- ── CARS ───────────────────────────────────────────────────────────────────
(33, 'MG 5 2023 — Dream Car',
     'Practical and affordable sedan with modern design. Full day with professional driver.',
     'mg5_01.jpg',         '01500000001', 'cars@whiteday.com',
      1700.00, 'Cairo',           'Cairo',            4.9,  90, 28, 7),

(34, 'Hyundai Elantra 2026 — Royal Crown',
     'Combines elegant design and practical performance. Full day with professional driver.',
     'elantra_01.jpg',     '01500000001', 'cars@whiteday.com',
      2200.00, 'Cairo',           'Cairo',            5.0,  95, 28, 7),

(35, 'Kia Sportage GT Line — White Pearl',
     'Stylish SUV offering comfort, modern features, and reliable performance. Full day with driver.',
     'kia_01.jpg',         '01500000001', 'cars@whiteday.com',
      3500.00, 'Cairo',           'Cairo',            5.2,  95, 28, 7),

-- ── ARTISTS & SINGERS ──────────────────────────────────────────────────────
(36, 'Bahaa Sultan',
     'Egyptian singer known for his smooth romantic voice and emotional style — perfect for weddings.',
     'bahaa_01.jpg',       '01600000001', 'bahaa@artists.com',
     400000.00, 'Cairo',          'Cairo',            4.9, 900, 29, 8),

(37, 'Mahmoud Al-Laithi',
     'Egyptian Shaabi singer known for his energetic style and vibrant performances.',
     'laithi_01.jpg',      '01600000002', 'mahmoud@artists.com',
     300000.00, 'Cairo',          'Cairo',            4.8, 800, 30, 8),

(38, 'Tamer Hosny',
     'Talented wedding singer known for creating unforgettable moments with a unique voice and stage presence.',
     'tamer_01.jpg',       '01600000003', 'tamer@artists.com',
     3000000.00,'Cairo',          'Cairo',            5.0,1000, 31, 8),

(39, 'Amr Diab',
     'Legendary Egyptian singer known for iconic hits, smooth voice, and energetic performances.',
     'amrdiab_01.jpg',     '01600000004', 'amr@artists.com',
     5000000.00,'Cairo',          'Cairo',            5.0,2000, 32, 8),

-- ── EMERGENCY BAG ──────────────────────────────────────────────────────────
(40, 'Bridal Emergency Bag',
     'A fully stocked bag with everything a bride might need for any unexpected situation.',
     'bag_01.jpg',         '01800000001', 'extras@whiteday.com',
      2000.00, 'Cairo',           'Cairo',            4.5,  60, 34, 9),

-- ── BRIDESMAID ─────────────────────────────────────────────────────────────
(41, 'Bridesmaid Service',
     'Your bridesmaid will be by your side all day ensuring you look flawless and feel calm.',
     'bridesmaid_01.jpg',  '01800000001', 'extras@whiteday.com',
      5000.00, 'Cairo',           'Cairo',            4.8,  80, 34, 10),

-- ── EXTRA SERVICES ─────────────────────────────────────────────────────────
(42, 'Bride Breakfast & Snack Package',
     'Delicious breakfast and snacks specially prepared for the bride and groom to keep energy high.',
     'breakfast_01.jpg',   '01800000001', 'extras@whiteday.com',
      2000.00, 'Cairo',           'Cairo',            4.1,  80, 34, 11),

(43, 'Relax & Glow Spa Package',
     'Full day of relaxation: Jacuzzi, spa, massage, Moroccan bath, facial cleansing, and oil bath.',
     'spa_01.jpg',         '01800000001', 'extras@whiteday.com',
      1500.00, 'Cairo',           'Cairo',            4.9,  85, 34, 11),

-- ── BARBER SHOP ────────────────────────────────────────────────────────────
(44, 'Royal Groom Package',
     'Full grooming: haircut, beard trim, GK oil treatment, Baderma facial, manicure, pedicure, groom finishing.',
     'barber_royal.jpg',   '01700000001', 'barber@whiteday.com',
      4200.00, 'Cairo',           'Cairo',            5.1, 130, 33, 12),

(45, 'Groom Glow Package',
     'Clean cut grooming: haircut, beard trim, hot oil treatment, facial cleansing.',
     'barber_glow.jpg',    '01700000001', 'barber@whiteday.com',
      1450.00, 'Cairo',           'Cairo',            4.7, 100, 33, 12),

(46, 'The Gentleman Package',
     'Premium grooming: haircut, beard trim, hot oil treatment, Hydrafacial, manicure and pedicure.',
     'barber_gent.jpg',    '01700000001', 'barber@whiteday.com',
      2900.00, 'Cairo',           'Cairo',            4.8, 100, 33, 12);



INSERT INTO service_detail (detail_id, service_id, detail_key, detail_val) VALUES
-- Rixos Plaza Hall (service_id = 1)
(1,  1,  'Capacity',              '300 Guests'),
(2,  1,  'Parking',               'Available'),
(3,  1,  'Air Conditioning',      'Yes'),
(4,  1,  'Bridal Room',           'Yes'),
(5,  1,  'Lighting & Sound',      'Yes'),
(6,  1,  'Custom Decoration',     'Available'),
(7,  1,  'Set Menu Options',      'Yes'),
(8,  1,  'Kids Area',             'Yes'),
(9,  1,  'Live Band',             'Yes'),
(10, 1,  'DJ',                    'Available'),
-- Arkan Hall (service_id = 2)
(11, 2,  'Capacity',              '250 Guests'),
(12, 2,  'Air Conditioning',      'Yes'),
(13, 2,  'Dance Floor',           'Yes'),
(14, 2,  'Bridal Room',           'Yes'),
(15, 2,  'Lighting & Sound',      'Yes'),
(16, 2,  'Fire Show',             'Yes'),
(17, 2,  'Set Menu Options',      'Yes'),
(18, 2,  '4K Video',              'Yes'),
(19, 2,  'Live Band',             'Yes'),
(20, 2,  'DJ',                    'Available'),
-- Cinderella Hall (service_id = 3)
(21, 3,  'Capacity',              '250 Guests'),
(22, 3,  'Open Air',              'Yes'),
(23, 3,  'Dance Floor',           'Yes'),
(24, 3,  'Bridal Room',           'Yes'),
(25, 3,  'Lighting & Sound',      'Yes'),
(26, 3,  'Custom Decoration',     'Available'),
(27, 3,  'Set Menu Options',      'Yes'),
(28, 3,  '4K Video',              'Yes'),
(29, 3,  'Live Band',             'Yes'),
(30, 3,  'DJ',                    'Available'),
-- Askar Hall (service_id = 4)
(31, 4,  'Capacity',              '350 Guests'),
(32, 4,  'Open Air',              'Yes'),
(33, 4,  'Dance Floor',           'Yes'),
(34, 4,  'Bridal Room',           'Yes'),
(35, 4,  'Lighting & Sound',      'Yes'),
(36, 4,  'Fire Show',             'Yes'),
(37, 4,  'Set Menu Options',      'Yes'),
(38, 4,  '4K Video',              'Yes'),
(39, 4,  'Live Band',             'Yes'),
(40, 4,  'DJ',                    'Available'),
-- Sara Salama Makeup (service_id = 9)
(41, 9,  'Bridal Makeup',         'Yes'),
(42, 9,  'Engagement Makeup',     'Yes'),
(43, 9,  'Party & Event Makeup',  'Yes'),
(44, 9,  'Hairstyling',           'Yes'),
-- Yasmin Ahmed (service_id = 10)
(45, 10, 'Bridal Makeup',         'Yes'),
(46, 10, 'Engagement Makeup',     'Yes'),
(47, 10, 'Party & Event Makeup',  'Yes'),
(48, 10, 'Hairstyling',           'Yes'),
(49, 10, 'Veil Styling',          'Yes'),
-- Hend Mohamed (service_id = 11)
(50, 11, 'Bridal Makeup',         'Yes'),
(51, 11, 'Engagement Makeup',     'Yes'),
(52, 11, 'Party & Event Makeup',  'Yes'),
(53, 11, 'Hairstyling',           'Yes'),
(54, 11, 'Veil Styling',          'Yes'),
-- Royal Dream Dress (service_id = 15)
(55, 15, 'Size',                  'S / M / L'),
(56, 15, 'Color',                 'White'),
(57, 15, 'Fabric',                'Lace & Tulle'),
(58, 15, 'Style',                 'Straight'),
(59, 15, 'Extension',             'Yes'),
-- Golden Queen Dress (service_id = 16)
(60, 16, 'Size',                  'S / M / L / XL'),
(61, 16, 'Color',                 'Gold / Baby Blue'),
(62, 16, 'Fabric',                'Lace & Tulle'),
(63, 16, 'Style',                 'Straight'),
-- Moonlight Dress (service_id = 17)
(64, 17, 'Size',                  'S / M / L'),
(65, 17, 'Color',                 'White'),
(66, 17, 'Fabric',                'Lace & Tulle'),
(67, 17, 'Style',                 'Straight'),
(68, 17, 'Long Wedding Veil',     'Included'),
-- Diamond Glow Dress (service_id = 18)
(69, 18, 'Size',                  'S / M'),
(70, 18, 'Color',                 'Off White / Rose Pink'),
(71, 18, 'Fabric',                'Lace & Tulle'),
(72, 18, 'Style',                 'Straight'),
-- Royal Black Suit (service_id = 23)
(73, 23, 'Size',                  '44 / 46 / 48 / 50 / 52'),
(74, 23, 'Color',                 'Black'),
(75, 23, 'Material',              '65% Polyester, 35% Viscose'),
(76, 23, 'Pieces',                '3 (Pants, Jacket, Vest)'),
-- Noble White Suit (service_id = 24)
(77, 24, 'Size',                  '44 / 46 / 48 / 50 / 52 / 54'),
(78, 24, 'Color',                 'White'),
(79, 24, 'Material',              '65% Polyester, 35% Viscose'),
(80, 24, 'Pieces',                '3 (Pants, Jacket, Vest)'),
-- Shadow Royal Suit (service_id = 25)
(81, 25, 'Size',                  '46 / 48 / 50 / 52'),
(82, 25, 'Color',                 'Black'),
(83, 25, 'Material',              '65% Polyester, 35% Viscose'),
(84, 25, 'Pieces',                '2 (Pants, Jacket)'),
-- Velet Burgundy Suit (service_id = 26)
(85, 26, 'Size',                  '46 / 48 / 50 / 52 / 58 / 60'),
(86, 26, 'Color',                 'Burgundy'),
(87, 26, 'Material',              '65% Polyester, 35% Viscose'),
(88, 26, 'Pieces',                '3 (Pants, Jacket, Vest)'),
-- Photographers (service_ids 27-32)
(89, 27, 'Coverage',              'Preparation, Session, Church, Party'),
(90, 28, 'Coverage',              'Preparation, Session, Church, Party'),
(91, 29, 'Coverage',              'Preparation, Session, Church, Party'),
(92, 30, 'Coverage',              'Preparation, Session, Church, Party'),
(93, 31, 'Coverage',              'Preparation, Session, Church, Party'),
(94, 32, 'Coverage',              'Preparation, Session, Church, Party'),
-- Cars (service_ids 33-35)
(95, 33, 'Duration',              'Full Day'),
(96, 33, 'Decoration',            'Flowers & Ribbons'),
(97, 33, 'Lighting',              'LED & Special Night Effects'),
(98, 33, 'Driver',                'Professional Driver Included'),
(99, 34, 'Duration',              'Full Day'),
(100,34, 'Decoration',            'Flowers & Ribbons'),
(101,34, 'Lighting',              'LED & Special Night Effects'),
(102,34, 'Driver',                'Professional Driver Included'),
(103,35, 'Duration',              'Full Day'),
(104,35, 'Decoration',            'Flowers & Ribbons'),
(105,35, 'Lighting',              'LED & Special Night Effects'),
(106,35, 'Driver',                'Professional Driver Included'),
-- Artists (service_ids 36-39)
(107,36, 'Duration',              '1 Hour'),
(108,36, 'Music Style',           'Romantic / Party'),
(109,36, 'Band Members',          '5'),
(110,36, 'Availability',          'All Governorates'),
(111,37, 'Duration',              '1 Hour'),
(112,37, 'Music Style',           'Romantic / Party'),
(113,37, 'Band Members',          '15'),
(114,37, 'Availability',          'All Governorates'),
(115,38, 'Duration',              '2 Hours'),
(116,38, 'Music Style',           'Romantic / Party'),
(117,38, 'Band Members',          '10'),
(118,38, 'Availability',          'All Governorates'),
(119,39, 'Duration',              '2 Hours'),
(120,39, 'Music Style',           'Romantic / Party'),
(121,39, 'Band Members',          '20'),
(122,39, 'Availability',          'All Governorates'),
-- Emergency Bag (service_id = 40)
(123,40, 'Mini Sewing Kit',       'Yes'),
(124,40, 'Stain Remover Pen',     'Yes'),
(125,40, 'Makeup Touch-Up Kit',   'Yes'),
(126,40, 'Hair Ties & Clips',     'Yes'),
(127,40, 'Pain Relievers',        'Yes'),
-- Bridesmaid (service_id = 41)
(128,41, 'All Day Attendance',    'Yes'),
(129,41, 'Dress & Veil Fixing',   'Yes'),
(130,41, 'Nerve Calming Support', 'Yes'),
(131,41, 'Schedule Coordination', 'Yes'),
(132,41, 'Last-Minute Issues',    'Handled'),
-- Spa Package (service_id = 43)
(133,43, 'Massage Session',       'Yes'),
(134,43, 'Facial Cleansing',      'Yes'),
(135,43, 'Spa',                   'Yes'),
(136,43, 'Moroccan Bath',         'Yes'),
(137,43, 'Oil Bath',              'Yes'),
-- Royal Groom Barber (service_id = 44)
(138,44, 'Haircut',               'Yes'),
(139,44, 'Beard Trim',            'Yes'),
(140,44, 'GK Oil Treatment',      'Yes'),
(141,44, 'Baderma Facial',        'Yes'),
(142,44, 'Manicure & Pedicure',   'Yes'),
(143,44, 'Groom Finishing',       'Yes'),
-- Groom Glow Barber (service_id = 45)
(144,45, 'Haircut',               'Yes'),
(145,45, 'Beard Trim',            'Yes'),
(146,45, 'Hot Oil Treatment',     'Yes'),
(147,45, 'Facial Cleansing',      'Yes'),
-- Gentleman Barber (service_id = 46)
(148,46, 'Haircut',               'Yes'),
(149,46, 'Beard Trim',            'Yes'),
(150,46, 'Hot Oil Treatment',     'Yes'),
(151,46, 'Hydrafacial',           'Yes'),
(152,46, 'Manicure & Pedicure',   'Yes');


INSERT INTO booking
  (booking_id, status, booking_date, delivery_date, total_amount, user_id)
VALUES
(101, 'completed',   '2024-01-10', '2024-02-14',  20000.00, 2),
(102, 'completed',   '2024-02-01', '2024-03-01',  28500.00, 3),
(103, 'pending',     '2024-03-05', '2024-05-20',  25000.00, 4),
(104, 'in progress', '2024-03-10', '2024-04-15',  11450.00, 5),
(105, 'cancelled',   '2024-01-20', '2024-02-20',  10450.00, 2),
(106, 'confirmed',   '2024-04-01', '2024-06-10',  43100.00, 3),
(107, 'completed',   '2024-02-15', '2024-03-30',  17700.00, 4),
(108, 'pending',     '2024-04-05', '2024-07-12',  23500.00, 5);


INSERT INTO booking_includes (booking_id, service_id, quantity, unit_price) VALUES
-- 101: Rixos Hall only
(101, 1,  1, 20000.00),
-- 102: Cinderella Hall + Sara Salama Makeup
(102, 3,  1, 23000.00),
(102, 9,  1,  5500.00),
-- 103: Arkan Hall
(103, 2,  1, 25000.00),
-- 104: Crystal Hall + Groom Glow Barber
(104, 5,  1, 10000.00),
(104, 45, 1,  1450.00),
-- 105: Lavender Dream Dress + Groom Glow Barber (cancelled)
(105, 19, 1,  9000.00),
(105, 45, 1,  1450.00),
-- 106: Rixos Hall + Diamond Glow Dress + MG5 Car
--      + Gentleman Barber + Bridesmaid + Breakfast
(106, 1,  1, 20000.00),
(106, 18, 1, 11500.00),
(106, 33, 1,  1700.00),
(106, 46, 1,  2900.00),
(106, 41, 1,  5000.00),
(106, 42, 1,  2000.00),
-- 107: Shadow Royal Suit + Royal Groom Barber
(107, 25, 1, 13500.00),
(107, 44, 1,  4200.00),
-- 108: Moonlight Dress + Yasmin Ahmed Makeup
(108, 17, 1, 17000.00),
(108, 10, 1,  6500.00);


INSERT INTO wallet_payment
  (transaction_id, payment_method, amount, commission,
   balance_after, payment_date, booking_id, user_id)
VALUES
(501, 'card',   20000.00, 1000.00, NULL,    '2024-01-10', 101, 2),
(502, 'wallet', 28500.00, 1425.00, 5000.00, '2024-02-01', 102, 3),
(503, 'card',   25000.00, 1250.00, NULL,    '2024-03-05', 103, 4),
(504, 'wallet', 11450.00,  572.50, 3200.00, '2024-03-10', 104, 5),
(505, 'card',   10450.00,  522.50, NULL,    '2024-01-20', 105, 2),
(506, 'card',   43100.00, 2155.00, NULL,    '2024-04-01', 106, 3),
(507, 'wallet', 17700.00,  885.00, 8000.00, '2024-02-15', 107, 4),
(508, 'points', 23500.00, 1175.00, NULL,    '2024-04-05', 108, 5);




INSERT INTO review
  (review_id, rate_star, comment, created_at, user_id, service_id)
VALUES
(1,  4.8, 'Incredible hall, everything was perfect.',            '2024-02-15', 2, 1),
(2,  4.9, 'Cinderella Hall exceeded every expectation.',         '2024-03-02', 3, 3),
(3,  5.0, 'Crystal Hall was absolutely magical!',                '2024-04-16', 5, 5),
(4,  5.0, 'Arkan Hall — stunning in every detail.',              '2024-05-21', 4, 2),
(5,  4.9, 'Sara is incredibly talented. I felt like a queen.',   '2024-03-03', 3, 9),
(6,  4.8, 'Yasmin is professional and so creative.',             '2024-04-06', 5, 10),
(7,  5.0, 'Hend transformed me — outstanding work.',             '2024-02-16', 4, 11),
(8,  4.8, 'Royal Dream was everything I imagined.',              '2024-02-15', 2, 15),
(9,  4.9, 'Moonlight dress was breathtaking on the day.',        '2024-04-07', 5, 17),
(10, 4.8, 'Royal Black suit made me feel like royalty.',         '2024-02-16', 4, 23),
(11, 4.9, 'Shadow Royal — sleek, modern, loved it.',             '2024-03-31', 4, 25),
(12, 4.7, 'Agha captured every emotion perfectly.',              '2024-02-15', 2, 27),
(13, 4.9, 'Dart Wedding photos are pure art.',                   '2024-03-03', 3, 28),
(14, 5.0, 'Aboutaleb is a true professional.',                   '2024-03-02', 3, 29),
(15, 4.9, 'MG5 was beautifully decorated. Driver was polite.',   '2024-04-16', 5, 33),
(16, 5.0, 'Elantra looked amazing at the ceremony.',             '2024-04-02', 3, 34),
(17, 4.9, 'Bahaa Sultan made the night unforgettable.',          '2024-03-03', 3, 36),
(18, 5.0, 'Tamer Hosny was beyond words. Pure magic.',           '2024-02-15', 2, 38),
(19, 5.0, 'Royal Groom Package — best grooming experience.',     '2024-03-31', 4, 44),
(20, 4.7, 'Groom Glow — clean, fast, professional.',             '2024-04-16', 5, 45),
(21, 4.5, 'Emergency bag saved us twice on the wedding day!',    '2024-03-03', 3, 40),
(22, 4.8, 'Bridesmaid was calm, capable, and caring.',           '2024-02-15', 2, 41),
(23, 4.9, 'Relax & Glow Spa was the perfect pre-wedding treat.', '2024-04-02', 3, 43);


INSERT INTO dispute
  (dispute_id, issue_description, manager_decision, created_at, user_id, booking_id)
VALUES
(1, 'Service not delivered as described.',       'refunded',      '2024-02-16', 2, 105),
(2, 'Provider arrived 2 hours late.',            'warning',       '2024-03-04', 3, 102),
(3, 'Extra charges added without agreement.',    'dismissed',     '2024-03-06', 4, 103),
(4, 'Minor dress damage upon delivery.',         'investigating',  '2024-04-08', 5, 108),
(5, 'Payment deducted but booking unconfirmed.', 'fixed',         '2024-04-02', 3, 106);



-- 1. View platform contact info
SELECT * FROM platform_contact;

-- 2. All services with type, provider name, and contact info
SELECT
    st.service_name                            AS category,
    s.s_name                                   AS service,
    s.price                                    AS starting_price_LE,
    s.avg_rating,
    s.review_count,
    s.city,
    s.location,
    s.contact_phone,
    s.contact_email,
    CONCAT(u.first_name,' ',u.last_name)       AS provider
FROM service      s
JOIN service_type st ON s.t_id    = st.t_id
JOIN users        u  ON s.user_id = u.user_id
ORDER BY st.service_name, s.price;

-- 3. Full booking summary per customer
SELECT
    CONCAT(u.first_name,' ',u.last_name)       AS customer_name,
    u.phone                                    AS customer_phone,
    u.email                                    AS customer_email,
    b.booking_id,
    b.status,
    b.booking_date,
    b.delivery_date,
    b.total_amount,
    STRING_AGG(s.s_name, ' | ')                AS services_booked
FROM users            u
JOIN booking          b  ON u.user_id     = b.user_id
JOIN booking_includes bi ON b.booking_id  = bi.booking_id
JOIN service          s  ON bi.service_id = s.service_id
GROUP BY
    u.first_name, u.last_name, u.phone, u.email,
    b.booking_id, b.status,
    b.booking_date, b.delivery_date, b.total_amount
ORDER BY b.booking_date;

-- 4. Service contact info for a specific service (e.g. Sara Salama)
SELECT
    s.s_name,
    s.contact_phone,
    s.contact_email,
    CONCAT(u.first_name,' ',u.last_name) AS provider_name,
    u.phone                              AS provider_phone,
    u.email                              AS provider_email
FROM service s
JOIN users   u ON s.user_id = u.user_id
WHERE s.service_id = 9;

-- 5. Revenue and commission per service type (completed bookings)
SELECT
    st.service_name,
    COUNT(DISTINCT b.booking_id)             AS total_bookings,
    SUM(bi.unit_price * bi.quantity)         AS total_revenue_LE,
    SUM(wp.commission)                       AS total_commission_LE
FROM service_type     st
JOIN service          s  ON st.t_id       = s.t_id
JOIN booking_includes bi ON s.service_id  = bi.service_id
JOIN booking          b  ON bi.booking_id = b.booking_id
JOIN wallet_payment   wp ON b.booking_id  = wp.booking_id
WHERE b.status = 'completed'
GROUP BY st.service_name
ORDER BY total_revenue_LE DESC;

-- 6. Top-rated service in each category
SELECT
    st.service_name  AS category,
    s.s_name         AS service,
    s.avg_rating,
    s.review_count,
    s.contact_phone,
    s.contact_email
FROM service      s
JOIN service_type st ON s.t_id = st.t_id
WHERE s.avg_rating = (
    SELECT MAX(s2.avg_rating)
    FROM   service s2
    WHERE  s2.t_id = s.t_id
)
ORDER BY s.avg_rating DESC;

-- 7. All disputes with full context
SELECT
    d.dispute_id,
    CONCAT(u.first_name,' ',u.last_name)  AS customer,
    u.phone                               AS customer_phone,
    b.booking_id,
    b.status                              AS booking_status,
    d.issue_description,
    d.manager_decision,
    d.created_at
FROM dispute  d
JOIN users    u ON d.user_id    = u.user_id
JOIN booking  b ON d.booking_id = b.booking_id
ORDER BY d.created_at;

-- 8. Full specs for any service
SELECT
    s.s_name,
    s.price,
    s.contact_phone,
    s.contact_email,
    sd.detail_key,
    sd.detail_val
FROM service        s
JOIN service_detail sd ON s.service_id = sd.service_id
WHERE s.service_id = 1   -- change ID to view any service
ORDER BY sd.detail_key;

-- 9. Monthly platform commission earned
SELECT
    FORMAT(payment_date, 'yyyy-MM')  AS month,
    COUNT(*)                         AS transactions,
    SUM(amount)                      AS total_charged_LE,
    SUM(commission)                  AS commission_earned_LE
FROM wallet_payment
GROUP BY FORMAT(payment_date, 'yyyy-MM')
ORDER BY month;

-- 10. Verify all tables
SELECT * FROM platform_contact;
SELECT * FROM users;
SELECT * FROM service_type;
SELECT * FROM service;
SELECT * FROM service_detail;
SELECT * FROM booking;
SELECT * FROM booking_includes;
SELECT * FROM wallet_payment;
SELECT * FROM review;
SELECT * FROM dispute;

SELECT 
    s.s_name AS Makeup_Artist,
    sd.detail_key AS Service_Feature,
    sd.detail_val AS Availability
FROM service s
JOIN service_detail sd ON s.service_id = sd.service_id
WHERE s.t_id = 4
ORDER BY s.s_name;

SELECT 
    s_name AS Makeup_Artist,
    price AS Highest_Price_LE,
    city,
    contact_phone
FROM service
WHERE t_id = 4 
  AND price = (SELECT MAX(price) FROM service WHERE t_id = 4);

  SELECT 
    s_name AS Makeup_Artist,
    price AS Lowest_Price_LE,
    city,
    contact_phone
FROM service
WHERE t_id = 4 
  AND price = (SELECT MIN(price) FROM service WHERE t_id = 4);