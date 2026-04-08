import dayjs from 'dayjs';
import defaultPromotion from '@assets/Product.png';
import TRAFFIC_DATA from '../Map/Trafic-wilaya';    


const dailyData = [
  { name: '00:00', visitors: 30 },
  { name: '04:00', visitors: 15 },
  { name: '08:00', visitors: 80 },
  { name: '12:00', visitors: 120 },
  { name: '16:00', visitors: 90 },
  { name: '20:00', visitors: 60 },
];

const weeklyData = [
  { name: 'Mon', visitors: 120 },
  { name: 'Tue', visitors: 190 },
  { name: 'Wed', visitors: 150 },
  { name: 'Thu', visitors: 210 },
  { name: 'Fri', visitors: 180 },
  { name: 'Sat', visitors: 240 },
  { name: 'Sun', visitors: 170 },
];

const monthlyData = [
  { name: 'Week 1', visitors: 850 },
  { name: 'Week 2', visitors: 1200 },
  { name: 'Week 3', visitors: 950 },
  { name: 'Week 4', visitors: 1100 },
];

const clickData = {
  dailyData: dailyData,
  weeklyData: weeklyData,
  monthlyData: monthlyData,
};
const weeklyPromoPerformance = [
  { name: 'Promo 1', clicks: 400 },
  { name: 'Promo 2', clicks: 300 },
  { name: 'Promo 3', clicks: 200 },
  { name: 'Promo 4', clicks: 278 },
  { name: 'Promo 5', clicks: 189 },
];

const cityDistribution = [
  { name: 'Algiers', value: 35 },
  { name: 'Oran', value: 25 },
  { name: 'Constantine', value: 20 },
  { name: 'Annaba', value: 10 },
  { name: 'Others', value: 10 },
];

const deviceData = [
  { name: 'Mobile', value: 65 },
  { name: 'Desktop', value: 25 },
  { name: 'Tablet', value: 10 },
];

const adminCards = [
  { title: 'Active Deals', value: '1,234', change: '+5%' },
  { title: 'User Registrations', value: '567', change: '+2%' },
  { title: 'Site Traffic', value: '8,910', change: '+8%' },
  { title: 'Engagement Rate', value: '75%', change: '+3%' }
];

const trafficMapVisitor={
   MapTitle :"Traffic Visitor Map",
   CardTitle: "Visitor",
   data:TRAFFIC_DATA
}

const trafficMapClick={
  MapTitle :"Traffic Click Map",
  CardTitle: "Click",
  data:TRAFFIC_DATA
}


const generalData={
    weeklyPromoPerformance:weeklyPromoPerformance,
    cityDistribution:cityDistribution,
    deviceDistribution: deviceData,
    trafficMapVisitor:trafficMapVisitor,
    trafficMapClick: trafficMapClick
}

const generalDataModerator={
    weeklyPromoPerformance:weeklyPromoPerformance,
    cityDistribution:cityDistribution,
    deviceDistribution: deviceData,
}

const generalDataCompany={
    weeklyPromoPerformance:weeklyPromoPerformance,
    cityDistribution:cityDistribution,
    deviceDistribution: deviceData,
}

const newdata = [
  { name: 'Fashion', value: 35 },
  { name: 'Electronics', value: 25 },
  { name: 'Groceries', value: 20 },
  { name: 'Home Appliances', value: 15 },
  { name: 'Other', value: 5 }
];

const newData1 = [

  { name: 'Nike', value: 45 },
  { name: 'Toystore', value: 30 },
  { name: 'addids', value: 20 },
  { name: 'baraka mole', value: 10 },
  { name: 'Other', value: 5 }
];
const cardsUser = [
  { title: 'Following', value: '24', change: '+3' },
  { title: 'Liked Deals', value: '56', change: '+8' },
  { title: 'New Deals Today', value: '32', change: '+5' }
];


const generalDataUser={
    newdata:newdata,
    newData1:newData1,
    cards:cardsUser
}


const Companycstatistic = [
  { title: 'Active Promotions', value: '12', change: '+2' },
  { title: 'Total Views', value: '8,752', change: '+12%' },
  { title: 'Engagement Rate', value: '42%', change: '+5%' },
  { title: 'Followers', value: '2,345', change: '+5%' },
  { title: 'Conversion Rate', value: '8.5%', change: '+1.2%'}
];

const companieStatistic = [
  { title: 'number of companies', value: '12', change: '+2' },
  { title: 'Total Views', value: '8,752', change: '+12%' },
  { title: 'Engagement Rate', value: '42%', change: '+5%' },
  { title: 'Conversion Rate', value: '8.5%', change: '+1.2%'}
];
const createPromotions = (companyID ,companyName) => [
    {
      id: 1+companyID,
      company:companyName,
      companyID: companyID,
      createdByID: 1,
      editedByID: [companyID ,5],
      name: 'JBL Casque Bluetooth 500',
      description: 'High-quality wireless Bluetooth headphones with noise cancellation and premium sound quality.',
      category: ["Smartwatches"],
      price: 2000.00,
      discount: 50,
      rating: 4,
      Likes: 120,
      Clicks:5000,
      Link:'https://www.jbl.com/',
      images: [defaultPromotion, defaultPromotion, defaultPromotion, defaultPromotion],
      createdAt: dayjs().subtract(1, 'day').toISOString(), // NEW - Added 1 day ago
      startDate: dayjs().subtract(2, 'day').toISOString(),
      endDate: dayjs().add(5, 'day').toISOString()
    },
    {
      id: 2+companyID,
      company:companyName,
      companyID: companyID,
      createdByID: 1,
      editedByID: [companyID ,5],
      name: 'Sony WH-1000XM4',
      description: 'Industry-leading noise canceling with Dual Noise Sensor technology.',
      category: ["Smartwatches"],
      price: 4500.00,
      discount: 30,
      rating: 5,
      Likes: 0,
      Clicks:2000,
      Link:'https://www.sony.com/',
      images: [defaultPromotion, defaultPromotion, defaultPromotion, defaultPromotion],
      createdAt: dayjs().subtract(2, 'day').toISOString(), // NEW - Added 2 days ago
      startDate: dayjs().add(2, 'day').toISOString(),
      endDate: dayjs().add(10, 'day').toISOString()
    },
    {
      id: 3+companyID,
      company:companyName,
      companyID: companyID,
      createdByID: 1,
      editedByID: [companyID ,5],
      name: 'Beats Solo3 Wireless',
      description: 'Award-winning sound with up to 40 hours of battery life.',
      category: ["Men's Clothing","Smartwatches"],
      price: 3800.00,
      discount: 40,
      rating: 3,
      Likes: 0,
      Clicks:6000,
      Link:'https://www.beatsbydre.com/',
      images: [defaultPromotion, defaultPromotion, defaultPromotion, defaultPromotion],
      createdAt: dayjs().subtract(5, 'day').toISOString(), // OLD - Added 5 days ago (won't show "New!")
      startDate: dayjs().add(2, 'day').toISOString(),
      endDate: dayjs().add(10, 'day').toISOString()
    },
    {
      id: 4+companyID,
      company:companyName,
      companyID: companyID,
      createdByID: 1,
      editedByID: [companyID ,5],
      name: 'iPhone 15 Pro Max',
      description: 'The most powerful iPhone ever with A17 Pro chip and titanium design.',
      category: ["Smartphones"],
      price: 150000.00,
      discount: 15, // WITH DISCOUNT + NEW - Will show BOTH badges ✅
      rating: 5,
      Likes: 250,
      Clicks:8000,
      Link:'https://www.apple.com/',
      images: [defaultPromotion, defaultPromotion, defaultPromotion, defaultPromotion],
      createdAt: dayjs().subtract(1, 'day').toISOString(), // NEW - Added 1 day ago ✅
      startDate: dayjs().subtract(2, 'day').toISOString(),
      endDate: dayjs().add(15, 'day').toISOString()
    },
    {
      id: 5+companyID,
      company:companyName,
      companyID: companyID,
      createdByID: 1,
      editedByID: [companyID ,5],
      name: 'MacBook Air M3',
      description: 'Supercharged by M3 chip with up to 18 hours of battery life.',
      category: ["Computers & Laptops"],
      price: 180000.00,
      discount: 20, // WITH DISCOUNT + NEW - Will show BOTH badges ✅
      rating: 5,
      Likes: 180,
      Clicks:6500,
      Link:'https://www.apple.com/',
      images: [defaultPromotion, defaultPromotion, defaultPromotion, defaultPromotion],
      createdAt: dayjs().subtract(2, 'day').toISOString(), // NEW - Added 2 days ago ✅
      startDate: dayjs().subtract(3, 'day').toISOString(),
      endDate: dayjs().add(20, 'day').toISOString()
    },
    {
      id: 6+companyID,
      company:companyName,
      companyID: companyID,
      createdByID: 1,
      editedByID: [companyID ,5],
      name: 'AirPods Pro 2nd Gen',
      description: 'Active Noise Cancellation and Transparency mode with Adaptive Audio.',
      category: ["Tech Accessories"],
      price: 35000.00,
      discount: 25, // WITH DISCOUNT + NEW - Will show BOTH badges ✅
      rating: 4.5,
      Likes: 95,
      Clicks:4200,
      Link:'https://www.apple.com/',
      images: [defaultPromotion, defaultPromotion, defaultPromotion, defaultPromotion],
      createdAt: dayjs().toISOString(), // NEW - Added TODAY ✅
      startDate: dayjs().subtract(1, 'day').toISOString(),
      endDate: dayjs().add(10, 'day').toISOString()
    }
  ];


  const LikedPromotions = [
    {
      id: 123,
      company: "Apple",
      companyID: 50,
      createdByID: 1,
      editedByID: [50 ,5],
      name: 'JBL Casque Bluetooth 500',
      description: 'High-quality wireless Bluetooth headphones with noise cancellation.',
      category: ["Smartwatches"],
      price: 2000.00,
      discount: 50,
      rating: 4,
      Likes: 120,
      userRating: 4,
      isLiked:true,
      Link:'https://www.jbl.com/',
      images: [defaultPromotion, defaultPromotion, defaultPromotion, defaultPromotion],
      startDate: dayjs().subtract(2, 'day').toISOString(),
      endDate: dayjs().add(5, 'day').toISOString()
    },
    {
      id: 124,
      company:"Samsung",
      companyID: 40,
      name: 'Sony WH-1000XM4',
      description: 'Industry-leading noise canceling with Dual Noise Sensor technology.',
      category: ["Smartwatches","Women's Clothing"],
      price: 4500.00,
      discount: 30,
      rating: 5,
      Likes: 0,
      userRating: 5,
      isLiked:true,
      Link:'https://www.sony.com/',
      images: [defaultPromotion, defaultPromotion, defaultPromotion, defaultPromotion],
      startDate: dayjs().add(2, 'day').toISOString(),
      endDate: dayjs().add(10, 'day').toISOString()
    },
    {
      id: 125,
      company:"Beats",
      companyID: 30,
      name: 'Beats Solo3 Wireless',
      description: 'Award-winning sound with up to 40 hours of battery life.',
      category: ["Men's Clothing","Smartwatches"],
      price: 3800.00,
      discount: 40,
      rating: 3,
      Likes: 0,
      userRating: 3,
      isLiked:true,
      Link:'https://www.beatsbydre.com/',
      images: [defaultPromotion, defaultPromotion, defaultPromotion, defaultPromotion],
      startDate: dayjs().add(2, 'day').toISOString(),
      endDate: dayjs().add(10, 'day').toISOString()
    }
  ];



  const deletedPromotions = (companyID ,companyName) => [
    {
      id: 1+companyID,
      company:companyName,
      companyID: companyID,
      createdByID: companyID,
      editedByID: [companyID ,5],
      DeletedById: 5,
      deletedDate: dayjs().subtract(7, 'day').toISOString(),
      name: 'JBL Casque Bluetooth 500',
      description: 'High-quality wireless Bluetooth headphones with noise cancellation.',
      category: ["Smartwatches"],
      price: 2000.00,
      discount: 50,
      rating: 4,
      Likes: 120,
      Clicks:5000,
      Link:'https://www.jbl.com/',
      images: [defaultPromotion, defaultPromotion, defaultPromotion, defaultPromotion],
      startDate: dayjs().subtract(10, 'day').toISOString(),
      endDate: dayjs().subtract(5, 'day').toISOString()
    },
    {
      id: 2+companyID,
      company:companyName,
      companyID: companyID,
      createdByID: companyID,
      editedByID: [companyID ,5],
      DeletedById: null,
      deletedDate: dayjs().subtract(2, 'day').toISOString(),
      name: 'Sony WH-1000XM4',
      description: 'Industry-leading noise canceling headphones.',
      category: ["Smartwatches"],
      price: 4500.00,
      discount: 30,
      rating: 5,
      Likes: 0,
      Clicks:2000,
      Link:'https://www.sony.com/',
      images: [defaultPromotion, defaultPromotion, defaultPromotion, defaultPromotion],
      startDate: dayjs().subtract(10, 'day').toISOString(),
      endDate: dayjs().subtract(2, 'day').toISOString()
    },
    {
      id: 3+companyID,
      company:companyName,
      companyID: companyID,
      createdByID: 5,
      DeletedById: 5,
      editedByID: [companyID ,5],
      deletedDate: dayjs().subtract(5, 'day').toISOString(),
      name: 'Beats Solo3 Wireless',
      description: 'Award-winning sound with up to 40 hours of battery life.',
      category: ['Smartwatches'],
      price: 3800.00,
      discount: 40,
      rating: 3,
      Likes: 0,
      Clicks:6000,
      Link:'https://www.beatsbydre.com/',
      images: [defaultPromotion, defaultPromotion, defaultPromotion, defaultPromotion],
      startDate: dayjs().subtract(10, 'day').toISOString(),
      endDate: dayjs().subtract(2, 'day').toISOString()
    }
  ];

const companyData = [
    {   
    id: 30,
    createdByID: 4,
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Huawei_Logo.svg/320px-Huawei_Logo.svg.png',
    name: "HUAWEI",
    username: "uncommon_company",
    CompanyLink: "https://www.huawei.com/",
    role: "Company",
    handle: "@uncommon_user",
    followers: "1.2k",
    companyName: "Huawei",
    email: "eleomore@domain.com",
    phone: "+1234567890",
    address: "56 ABBANE RENOHANE",
    rc: "123456789",
    city: "ALGIERS",
    postalCode: "10000 - ALGER",
    generalData :generalDataCompany,
    clickData : clickData,
    subscriptionPlan: { id: 1, name: "Gold", color: "#FFD700", bgColor: "#FFF8DC", icon: "👑" },
    subscribeStartedate: dayjs().subtract(10, 'day').toISOString(),
    subscribeEnddate: dayjs().subtract(3, 'day').toISOString(),
    permission:{
                    canEdit: true,
                    canDelete: true,
                    canAdd: true
    },
    Companycstatistic: Companycstatistic,
    Promotion: createPromotions (30, "Huawei"),
    deletedPromotions: deletedPromotions (30, "Huawei"),
    },
    {
    id: 40,
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/488px-Apple_logo_black.svg.png',
    createdByID: 4,
    name: "APPLE",
    username: "uncommon_company",
    CompanyLink: "https://www.apple.com/",
    role: "Company",
    handle: "@uncommon_user",
    followers: "1.2k",
    companyName: "Apple",
    email: "eleomore@domain.com",
    phone: "+1234567890",
    address: "56 ABBANE RENOHANE",
    rc: "123456789",
    city: "ALGIERS",
    postalCode: "10000 - ALGER",
    generalData :generalDataCompany,
    clickData : clickData,
    subscriptionPlan: { id: 1, name: "Gold", color: "#FFD700", bgColor: "#FFF8DC", icon: "👑" },
    subscribeStartedate: dayjs().subtract(1, 'day').toISOString(),
    subscribeEnddate: dayjs().add(10, 'day').toISOString(),
    permission:{
                    canEdit: true,
                    canDelete: true,
                    canAdd: true
    },
    Companycstatistic: Companycstatistic,
    Promotion: createPromotions (40 ,"Apple"),
    deletedPromotions: deletedPromotions (40 ,"Apple"),
    },
    {
    id: 50,
    createdByID: 4,
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/320px-Samsung_Logo.svg.png',
    name: "SAMSUNG",
    username: "uncommon_company",
    CompanyLink: "https://www.samsung.com/",
    role: "Company",
    handle: "@uncommon_user",
    followers: "1.2k",
    companyName: "Samsung",
    email: "eleomore@domain.com",
    phone: "+1234567890",
    address: "56 ABBANE RENOHANE",
    rc: "123456789",
    city: "ALGIERS",
    postalCode: "10000 - ALGER",
    generalData :generalDataCompany,
    clickData : clickData,
    subscriptionPlan: { id: 2, name: "Silver", color: "#C0C0C0", bgColor: "#F5F5F5", icon: "🥈" },
    subscribeStartedate: dayjs().subtract(1, 'day').toISOString(),
    subscribeEnddate: dayjs().add(10, 'day').toISOString(),
    permission:{
                    canEdit: true,
                    canDelete: true,
                    canAdd: true
                },
    Companycstatistic: Companycstatistic,
    Promotion: createPromotions (50 ,  "Samsung"),
    deletedPromotions: deletedPromotions (50 ,  "Samsung"),
    },
    {
    id: 60,
    createdByID: 4,
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/320px-Coca-Cola_logo.svg.png',
    name: "COCA-COLA",
    username: "coca_cola_dz",
    CompanyLink: "https://www.coca-cola.com/",
    role: "Company",
    handle: "@coca_cola",
    followers: "2.5k",
    companyName: "Coca-Cola",
    email: "contact@cocacola.dz",
    phone: "+213234567890",
    address: "Zone Industrielle",
    rc: "987654321",
    city: "ORAN",
    postalCode: "31000 - ORAN",
    generalData :generalDataCompany,
    clickData : clickData,
    subscriptionPlan: { id: 3, name: "Bronze", color: "#CD7F32", bgColor: "#FFF5EE", icon: "🥉" },
    subscribeStartedate: dayjs().subtract(5, 'day').toISOString(),
    subscribeEnddate: dayjs().add(25, 'day').toISOString(),
    permission:{
                    canEdit: true,
                    canDelete: true,
                    canAdd: true
    },
    Companycstatistic: Companycstatistic,
    Promotion: createPromotions (60, "Coca-Cola"),
    deletedPromotions: deletedPromotions (60, "Coca-Cola"),
    },
    {
    id: 70,
    createdByID: 4,
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/320px-Logo_NIKE.svg.png',
    name: "NIKE",
    username: "nike_algeria",
    CompanyLink: "https://www.nike.com/",
    role: "Company",
    handle: "@nike",
    followers: "3.8k",
    companyName: "Nike",
    email: "info@nike.dz",
    phone: "+213456789012",
    address: "Centre Commercial",
    rc: "456789123",
    city: "CONSTANTINE",
    postalCode: "25000 - CONSTANTINE",
    generalData :generalDataCompany,
    clickData : clickData,
    subscriptionPlan: { id: 1, name: "Gold", color: "#FFD700", bgColor: "#FFF8DC", icon: "👑" },
    subscribeStartedate: dayjs().subtract(2, 'day').toISOString(),
    subscribeEnddate: dayjs().add(28, 'day').toISOString(),
    permission:{
                    canEdit: true,
                    canDelete: true,
                    canAdd: true
    },
    Companycstatistic: Companycstatistic,
    Promotion: createPromotions (70, "Nike"),
    deletedPromotions: deletedPromotions (70, "Nike"),
    },
    {
    id: 80,
    createdByID: 4,
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/320px-Adidas_Logo.svg.png',
    name: "ADIDAS",
    username: "adidas_dz",
    CompanyLink: "https://www.adidas.com/",
    role: "Company",
    handle: "@adidas",
    followers: "3.2k",
    companyName: "Adidas",
    email: "contact@adidas.dz",
    phone: "+213567890123",
    address: "Boulevard Principal",
    rc: "789123456",
    city: "ANNABA",
    postalCode: "23000 - ANNABA",
    generalData :generalDataCompany,
    clickData : clickData,
    subscriptionPlan: { id: 2, name: "Silver", color: "#C0C0C0", bgColor: "#F5F5F5", icon: "🥈" },
    subscribeStartedate: dayjs().subtract(3, 'day').toISOString(),
    subscribeEnddate: dayjs().add(27, 'day').toISOString(),
    permission:{
                    canEdit: true,
                    canDelete: true,
                    canAdd: true
    },
    Companycstatistic: Companycstatistic,
    Promotion: createPromotions (80, "Adidas"),
    deletedPromotions: deletedPromotions (80, "Adidas"),
    },
    {
    id: 90,
    createdByID: 4,
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/320px-H%26M-Logo.svg.png',
    name: "H&M",
    username: "hm_algeria",
    CompanyLink: "https://www.hm.com/",
    role: "Company",
    handle: "@hm",
    followers: "2.9k",
    companyName: "H&M",
    email: "info@hm.dz",
    phone: "+213678901234",
    address: "Centre Ville",
    rc: "321654987",
    city: "SETIF",
    postalCode: "19000 - SETIF",
    generalData :generalDataCompany,
    clickData : clickData,
    subscriptionPlan: { id: 3, name: "Bronze", color: "#CD7F32", bgColor: "#FFF5EE", icon: "🥉" },
    subscribeStartedate: dayjs().subtract(7, 'day').toISOString(),
    subscribeEnddate: dayjs().add(23, 'day').toISOString(),
    permission:{
                    canEdit: true,
                    canDelete: true,
                    canAdd: true
    },
    Companycstatistic: Companycstatistic,
    Promotion: createPromotions (90, "H&M"),
    deletedPromotions: deletedPromotions (90, "H&M"),
    },
    {
    id: 100,
    createdByID: 4,
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/320px-Microsoft_logo_%282012%29.svg.png',
    name: "MICROSOFT",
    username: "microsoft_dz",
    CompanyLink: "https://www.microsoft.com/",
    role: "Company",
    handle: "@microsoft",
    followers: "4.1k",
    companyName: "Microsoft",
    email: "contact@microsoft.dz",
    phone: "+213789012345",
    address: "Tech Park",
    rc: "654987321",
    city: "ALGIERS",
    postalCode: "16000 - ALGER",
    generalData :generalDataCompany,
    clickData : clickData,
    subscriptionPlan: { id: 1, name: "Gold", color: "#FFD700", bgColor: "#FFF8DC", icon: "👑" },
    subscribeStartedate: dayjs().subtract(4, 'day').toISOString(),
    subscribeEnddate: dayjs().add(26, 'day').toISOString(),
    permission:{
                    canEdit: true,
                    canDelete: true,
                    canAdd: true
    },
    Companycstatistic: Companycstatistic,
    Promotion: createPromotions (100, "Microsoft"),
    deletedPromotions: deletedPromotions (100, "Microsoft"),
    }
 ]

  const stats = [
    { 
      title: 'User Registrations', 
      value: '1,234', 
      change: '+5%',
    },
    { 
      title: 'Companies Registrations', 
      value: '567', 
      change: '+2%',

    },
    { 
      title: 'Moderators', 
      value: '42', 
      change: '+8%',

    },
  ];

 const adminData = [
    {
        id: 6,
        image:'https://i.pravatar.cc/150?img=6',
        createdByID: 4,
        username: "Admin",
        firstName:"akram",
        lastName :"Siad",
        email: "eleomore@domain.com",
        phone: "+1234567890",
        address: "56 ABBANE RENOHANE",
        city: "ALGIERS",  
        postalCode: "10000 - ALGER",
        role: "Moderator",
        addcompany: true,
        editcompany : false,
        deletecompany : false,
        clickData : clickData,
        generalData :generalDataModerator,
        companieStatistic: companieStatistic,
        assignedCompanies: [
            {
                companyData: companyData[0],
                permission:{
                    canEdit: true,
                    canDelete: true,
                    canAdd: true
                }
            },
            {
                companyData: companyData[1],
                permission:{
                    canEdit: true,
                    canDelete: true,
                    canAdd: false
                }
            }
        ]
    },
    {
        id: 5,
        image:'https://i.pravatar.cc/150?img=5',
        createdByID: 4,
        username: "Admin",
        firstName:"akram",
        lastName :"Siad",
        email: "eleomore@domain.com",
        phone: "+1234567890",
        address: "56 ABBANE RENOHANE",
        city: "ALGIERS",  
        postalCode: "10000 - ALGER",
        role: "Moderator",
        addcompany: true,
        editcompany : true,
        deletecompany : false,
        clickData : clickData,
        generalData :generalDataModerator,
        companieStatistic: companieStatistic,
        assignedCompanies: [
            {
                companyData: companyData[2],
                permission:{
                    canEdit: true,
                    canDelete: false,
                    canAdd: true
                }
            },
            {
                companyData: companyData[0],
                permission:{
                    canEdit: true,
                    canDelete: true,
                    canAdd: false
                }
            }
        ]
    },
    {
        id: 4,
        image:'https://i.pravatar.cc/150?img=4',
        username: "SuperAdmin",
        firstName:"akram",
        lastName :"Siad",
        email: "eleomore@domain.com",
        phone: "+1234567890",
        address: "56 ABBANE RENOHANE",
        city: "ALGIERS",
        postalCode: "10000 - ALGER",
        role: "Superadmin",
        usersStats: stats,
        addcompany: true,
        editcompany : true,
        deletecompany : true,
        adminCards: adminCards,
        clickData : clickData,
        generalData : generalData,
        companieStatistic: companieStatistic,
        assignedCompanies: [
            {
                companyData: companyData[0],
                permission:{
                    canEdit: true,
                    canDelete: true,
                    canAdd: true
                }
            },
            {
                companyData: companyData[1],
                permission:{
                    canEdit: true,
                    canDelete: true,
                    canAdd: true
                }
            },
            {
                companyData: companyData[2],
                permission:{
                    canEdit: false,
                    canDelete: true,
                    canAdd: true
                }
            }
        ]
    }
    ];


const allUsers=[
  { id: 6, username: "Admin" },
  { id: 5, username: "Admin" },
  { id: 4, username: "SuperAdmin" },
  { id: 30, username: "Huawei" },
  { id: 40, username: "Apple" },
  { id: 50, username: "Samsung" }
];


const usersData = [
  { 
    id: 1, 
    name: 'Ava Goodwin', 
    lastName: 'Goodwin',
    username: 'ava_goodwin', 
    email: 'ava.goodwin@example.com',
    city: 'New York',
    postalCode: '10001',
    generalData: generalDataUser,
    image: 'https://i.pravatar.cc/150?img=1', 
    subscribeStartedate: dayjs().subtract(1, 'day').toISOString(),
    role: 'User' ,
    likedPromotion: LikedPromotions,
    followedCompanies: [30,40],
  },
  { 
    id: 2, 
    name: 'Liam O\'Connor', 
    lastName: 'O\'Connor',
    username: 'liam_oconnor', 
    email: 'liam.oconnor@example.com',
    city: 'Boston',
    postalCode: '02108',
    image: 'https://i.pravatar.cc/150?img=2', 
    role: 'User' 
  },
  { 
    id: 3, 
    name: 'Sophia Lee', 
    lastName: 'Lee',
    username: 'sophia_lee', 
    email: 'sophia.lee@example.com',
    city: 'Chicago',
    postalCode: '60601',
    image: 'https://i.pravatar.cc/150?img=3', 
    role: 'Moderator',
    canAddCompany: true,
    canDeleteCompany: false
  },
  { 
    id: 4, 
    name: 'akram', 
    username: 'noah_patel', 
    email: 'noah.patel@company.com',
    city: 'San Francisco',
    postalCode: '94102',
    image: 'https://i.pravatar.cc/150?img=4', 
    role: 'Superadmin',
  },
  { 
    id: 5, 
    name: 'Isabella Martinez', 
    lastName: 'Martinez',
    username: '@isabella_martinez', 
    email: 'isabella.martinez@example.com',
    city: 'Los Angeles',
    postalCode: '90012',
    image: 'https://i.pravatar.cc/150?img=5', 
    role: 'User' 
  },
  { 
    id: 6, 
    name: 'Mason Nguyen', 
    lastName: 'Nguyen',
    username: '@mason_nguyen', 
    email: 'mason.nguyen@example.com',
    city: 'Seattle',
    postalCode: '98101',
    image: 'https://i.pravatar.cc/150?img=6', 
    role: 'Moderator',
    canAddCompany: true,
    canDeleteCompany: true
  },
  { 
    id: 50, 
    name: 'Mia Kim', 
    username: '@mia_kim', 
    email: 'mia.kim@company.com',
    city: 'Austin',
    postalCode: '78701',
    image: 'https://i.pravatar.cc/150?img=7', 
    role: 'Company',
    createdById: 6,
    deletedById: null
  },
  { 
    id: 8, 
    name: 'Oliver Brown', 
    lastName: 'Brown',
    username: '@oliver_brown', 
    email: 'oliver.brown@example.com',
    city: 'Denver',
    postalCode: '80202',
    image: 'https://i.pravatar.cc/150?img=8', 
    role: 'User' 
  },
  { 
    id: 40, 
    name: 'Emma White', 
    username: '@emma_white', 
    email: 'emma.white@company.com',
    city: 'Miami',
    postalCode: '33128',
    image: 'https://i.pravatar.cc/150?img=9', 
    role: 'Company',
    createdById: 10,
    deletedById: null
  },
  { 
    id: 10, 
    name: 'Ethan Black', 
    lastName: 'Black',
    username: '@ethan_black', 
    email: 'ethan.black@example.com',
    city: 'Atlanta',
    postalCode: '30303',
    image: 'https://i.pravatar.cc/150?img=10', 
    role: 'Moderator',
    canAddCompany: false,
    canDeleteCompany: true
  },
  { 
    id: 11, 
    name: 'Ava Goodwin', 
    lastName: 'Goodwin',
    username: '@ava_goodwin', 
    email: 'ava.goodwin2@example.com',
    city: 'Portland',
    postalCode: '97201',
    image: 'https://i.pravatar.cc/150?img=1', 
    role: 'User' 
  },
  { 
    id: 12, 
    name: 'Liam O\'Connor', 
    lastName: 'O\'Connor',
    username: '@liam_oconnor', 
    email: 'liam.oconnor2@example.com',
    city: 'Philadelphia',
    postalCode: '19102',
    image: 'https://i.pravatar.cc/150?img=2', 
    role: 'User' 
  },
  { 
    id: 13, 
    name: 'Sophia Lee', 
    lastName: 'Lee',
    username: '@sophia_lee', 
    email: 'sophia.lee2@example.com',
    city: 'Phoenix',
    postalCode: '85001',
    image: 'https://i.pravatar.cc/150?img=3', 
    role: 'Moderator',
    canAddCompany: true,
    canDeleteCompany: true
  },
  { 
    id: 30, 
    name: 'Noah Patel', 
    username: '@noah_patel', 
    email: 'noah.patel2@company.com',
    city: 'Dallas',
    postalCode: '75201',
    image: 'https://i.pravatar.cc/150?img=4', 
    role: 'Company',
    createdById: 13,
    deletedById: null
  },
  { 
    id: 15, 
    name: 'Isabella Martinez', 
    lastName: 'Martinez',
    username: '@isabella_martinez', 
    email: 'isabella.martinez2@example.com',
    city: 'Houston',
    postalCode: '77002',
    image: 'https://i.pravatar.cc/150?img=5', 
    role: 'User' 
  },
  { 
    id: 16, 
    name: 'Mason Nguyen', 
    lastName: 'Nguyen',
    username: '@mason_nguyen', 
    email: 'mason.nguyen2@example.com',
    city: 'San Diego',
    postalCode: '92101',
    image: 'https://i.pravatar.cc/150?img=6', 
    role: 'Moderator',
    canAddCompany: false,
    canDeleteCompany: false
  },
  { 
    id: 17, 
    name: 'Akram Kim', 
    username: '@mia_kim', 
    email: 'akram.kim@company.com',
    city: 'Las Vegas',
    postalCode: '89101',
    image: 'https://i.pravatar.cc/150?img=7', 
    role: 'Company',
    createdById: 3,
    deletedById: 10
  },
  { 
    id: 18, 
    name: 'Oliver Brown', 
    lastName: 'Brown',
    username: '@oliver_brown', 
    email: 'oliver.brown2@example.com',
    city: 'Orlando',
    postalCode: '32801',
    image: 'https://i.pravatar.cc/150?img=8', 
    role: 'User' 
  },
  { 
    id: 19, 
    name: 'ilyes White', 
    username: '@emma_white', 
    email: 'ilyes.white@company.com',
    city: 'Nashville',
    postalCode: '37201',
    image: 'https://i.pravatar.cc/150?img=9', 
    role: 'Company',
    createdById: 16,
    deletedById: null
  },
  { 
    id: 20, 
    name: 'Ethan Black', 
    lastName: 'Black',
    username: '@ethan_black', 
    email: 'ethan.black2@example.com',
    city: 'New Orleans',
    postalCode: '70112',
    image: 'https://i.pravatar.cc/150?img=10', 
    role: 'Moderator',
    canAddCompany: true,
    canDeleteCompany: true
  }
];


const deletedUsersData = [
  { 
    id: 1, 
    name: 'Ava Goodwin', 
    lastName: 'Goodwin',
    username: '@ava_goodwin', 
    email: 'ava.goodwin@example.com',
    city: 'New York',
    postalCode: '10001',
    image: 'https://i.pravatar.cc/150?img=1', 
    subscribeStartedate: dayjs().subtract(2, 'day').toISOString(),
    role: 'User',
    LikedPromotion: LikedPromotions,
    deletedDate: dayjs().subtract(1, 'day').toISOString(),
    deletedById: 4,
    deletedByName: 'Super Admin'
  },
  { 
    id: 2, 
    name: 'John Doe', 
    lastName: 'Doe',
    username: '@john_doe', 
    email: 'john.doe@example.com',
    city: 'Los Angeles',
    postalCode: '90001',
    image: 'https://i.pravatar.cc/150?img=2', 
    subscribeStartedate: dayjs().subtract(5, 'day').toISOString(),
    role: 'Moderator',
    LikedPromotion: LikedPromotions.slice(0, 1),
    deletedDate: dayjs().subtract(2, 'day').toISOString(),
    deletedById: 4,
    deletedByName: 'Super Admin'
  },
  { 
    id: 3, 
    name: 'Tech Corp', 
    lastName: '',
    username: '@tech_corp', 
    email: 'info@techcorp.com',
    city: 'San Francisco',
    postalCode: '94101',
    image: 'https://i.pravatar.cc/150?img=3', 
    subscribeStartedate: dayjs().subtract(10, 'day').toISOString(),
    role: 'Company',
    LikedPromotion: [],
    deletedDate: dayjs().subtract(3, 'day').toISOString(),
    deletedById: 4,
    deletedByName: 'Super Admin'
  },
];


const legalContent = [
  {
    title: "Terms of Service",
    description:
      "Welcome to Promodz. By accessing our platform, you agree to comply with our terms of service. Users are responsible for ensuring their actions comply with all applicable laws and regulations. Promodz reserves the right to modify these terms at any time. Continued use of the platform signifies acceptance of any changes."
  },
  {
    title: "User Rights and Responsibilities",
    description:
      "Users have the right to access and use the platform for lawful purposes. Any misuse, including but not limited to unauthorized access, distribution of harmful content, and infringement of intellectual property rights, is strictly prohibited. Users are responsible for maintaining the confidentiality of their account information."
  },
  {
    title: "Privacy Policy",
    description:
      "Promodz is committed to protecting user privacy. We collect, store, and use personal data in accordance with relevant laws and regulations. User data is used to enhance the platform's functionality and user experience. We do not share personal data with third parties without user consent, except as required by law."
  },
  {
    title: "Data Collection and Use",
    description:
      "We collect data to provide and improve our services. This includes information users provide during account registration, as well as data collected through user interactions with the platform. Collected data is used to personalize user experiences, troubleshoot issues, and conduct research and analysis."
  },
  {
    title: "Data Storage and Security",
    description:
      "User data is stored securely using industry-standard encryption and security practices. Access to personal data is restricted to authorized personnel only. We implement various measures to protect user data from unauthorized access, alteration, and disclosure."
  }
];

const sampleMessages = [
  {
    id: 1,
    fullName: "Alice Johnson",
    email: "alice@example.com",
    content: "Hi, I'm interested in your services.",
    dateSent: "2025-08-04T10:15:00",
    role: "user",
  },
  {
    id: 2,
    fullName: "Bob Smith",
    email: "bob@example.com",
    content: "Can I schedule a call?",
    dateSent: "2025-08-03T12:20:00",
    role: "company",
  },
  {
    id: 3,
    fullName: "Charlie Davis",
    email: "charlie@example.com",
    content: "Do you have more info on the offer?",
    dateSent: "2025-08-01T09:45:00",
    role: "user",
  },
];


const initialAds = [
  // Explore Page Ads (Sidebar)
  {
    id: 1,
    link: "https://www.amazon.com/deals",
    image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400&h=400&fit=crop"
  },
  {
    id: 2,
    link: "https://www.bestbuy.com/site/electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"
  },
  // Product Pages Ads
  {
    id: 3,
    link: "https://www.nike.com/sale",
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=200&fit=crop"
  },
  {
    id: 4,
    link: "https://www.samsung.com/us/smartphones/",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop"
  },
  // Additional Ad Slots
  {
    id: 5,
    link: "https://www.apple.com/iphone/",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&h=200&fit=crop"
  },
  {
    id: 6,
    link: "https://www.adidas.com/us/sale",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=200&fit=crop"
  },
  {
    id: 7,
    link: "https://www.sony.com/electronics/headphones",
    image: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=400&h=400&fit=crop"
  },
  {
    id: 8,
    link: "https://www.microsoft.com/store",
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=200&fit=crop"
  }
];

const initialPlans = [
  {
    id: 1,
    name: "Gold Plan – Promodz Golden",
    price: "199.99",
    tier: "Gold",
    color: "#FFD700",
    bgColor: "#FFF8DC",
    icon: "👑",
    features: [
      "Featured placement on homepage for 7 days",
      "Promotion on Instagram story + post + TikTok video",
      "Priority in weekly newsletter to users",
      "Free banner ad for 1 week",
      "Detailed promotion description (with photos, videos, location)",
      "Real-time performance analytics",
      "Access to A/B testing tools for promotion visuals"
    ]
  },
  {
    id: 2,
    name: "Silver Plan – Promodz Silver",
    price: "99.99",
    tier: "Silver",
    color: "#C0C0C0",
    bgColor: "#F5F5F5",
    icon: "🥈",
    features: [
      "Placement in second section of homepage",
      "Promotion on Instagram story + weekly story repost",
      "Included in weekly newsletter (standard listing)",
      "One image and short text description",
      "Limited performance insights"
    ]
  },
  {
    id: 3,
    name: "Palinyom Extra",
    price: "39.99",
    tier: "Bronze",
    color: "#CD7F32",
    bgColor: "#FFF5EE",
    icon: "🥉",
    features: [
      "Appears in category page only",
      "Text-only promotion with one link",
      "No social media boost",
      "Only listed for 3 days (short-term visibility)",
      "Best for flash deals, clearance, local shops"
    ]
  }
];

// Subscription plan presets for easy assignment
const subscriptionPlanPresets = {
  gold: { id: 1, name: "Gold", color: "#FFD700", bgColor: "#FFF8DC", icon: "👑" },
  silver: { id: 2, name: "Silver", color: "#C0C0C0", bgColor: "#F5F5F5", icon: "🥈" },
  bronze: { id: 3, name: "Bronze", color: "#CD7F32", bgColor: "#FFF5EE", icon: "🥉" },
  none: { id: 0, name: "Free", color: "#9CA3AF", bgColor: "#F3F4F6", icon: "📦" }
};


const TopHomePage = [
  {
    id: 1,
    name: "HUAWEI",
    CompanyLink: "https://www.huawei.com/",
    logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&h=60&fit=crop',
    image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=500&h=300&fit=crop',
    text: 'Up to 50% off on flagship phones this season!'
  },
  {
    id: 2,
    name: "APPLE",
    CompanyLink: "https://www.apple.com/",
    logo: 'https://images.unsplash.com/photo-1621768216002-5ac171876625?w=150&h=60&fit=crop',
    image: 'https://images.unsplash.com/photo-1611472173362-3f53dbd65d80?w=500&h=300&fit=crop',
    text: 'Discover exclusive deals on iPhone, iPad & MacBook'
  },
  {
    id: 3,
    name: "SAMSUNG",
    CompanyLink: "https://www.samsung.com/",
    logo: 'https://images.unsplash.com/photo-1583573607873-4cca79fe5326?w=150&h=60&fit=crop',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=300&fit=crop',
    text: 'Galaxy savings event - Save big on the latest tech'
  },
  {
    id: 4,
    name: "SONY",
    CompanyLink: "https://www.sony.com/",
    logo: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=150&h=60&fit=crop',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&h=300&fit=crop',
    text: 'Amazing audio and entertainment deals await you'
  },
  {
    id: 5,
    name: "LG",
    CompanyLink: "https://www.lg.com/",
    logo: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=150&h=60&fit=crop',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop',
    text: 'Smart home appliances at unbeatable prices'
  }
];


const categories = [
  {
    name: "Fashion & Apparel",
    subcategories: [
      "Men's Clothing",
      "Women's Clothing",
      "Kids' Clothing",
      "Shoes",
      "Accessories & Jewelry"
    ]
  },
  {
    name: "Electronics & Gadgets",
    subcategories: [
      "Smartphones",
      "Computers & Laptops",
      "TVs & Audio",
      "Smartwatches",
      "Tech Accessories"
    ]
  },
  {
    name: "Home & Living",
    subcategories: [
      "Furniture",
      "Kitchenware",
      "Home Décor",
      "Lighting",
      "Bedding & Bath"
    ]
  },
  {
    name: "Groceries & Food",
    subcategories: [
      "Fresh Produce",
      "Packaged Food",
      "Snacks & Drinks",
      "Organic & Gourmet",
      "Household Essentials"
    ]
  },
  {
    name: "Beauty & Personal Care",
    subcategories: [
      "Skincare",
      "Haircare",
      "Makeup",
      "Fragrances",
      "Men's Grooming"
    ]
  },
  {
    name: "Health & Fitness",
    subcategories: [
      "Supplements & Vitamins",
      "Fitness Equipment",
      "Medical Devices",
      "Yoga & Wellness"
    ]
  },
  {
    name: "Toys, Hobbies & Entertainment",
    subcategories: [
      "Toys & Games",
      "Books & Comics",
      "Art & Crafts",
      "Musical Instruments",
      "Collectibles"
    ]
  },
  {
    name: "Automotive & Tools",
    subcategories: [
      "Car Accessories",
      "Tools & Equipment",
      "Tires & Batteries",
      "Motorbike Gear",
      "DIY & Workshop"
    ]
  },
  {
    name: "Travel & Tourism",
    subcategories: [
      "Flight Tickets",
      "Hotel Deals",
      "Vacation Packages",
      "Car Rentals",
      "Cruises",
      "Travel Insurance",
      "Airport Transfers"
    ]
  }
];

const asArray = (value) => (Array.isArray(value) ? value : value == null ? [] : [value]);

const normalizePromotion = (promotion, fallbackCompanyId, fallbackCompanyName) => {
  if (!promotion || typeof promotion !== 'object') return promotion;

  const rawName = promotion.name ?? promotion.title ?? '';
  const companyId = promotion.companyId ?? promotion.companyID ?? fallbackCompanyId ?? null;
  const companyName = promotion.companyName ?? promotion.company ?? fallbackCompanyName ?? '';
  const categories = promotion.categories ?? promotion.category ?? [];
  const likesRaw = promotion.likes ?? promotion.Likes ?? 0;
  const likesNumber = Number(likesRaw);
  const likes = Number.isFinite(likesNumber) ? Math.max(0, Math.trunc(likesNumber)) : 0;

  const clicksRaw = promotion.clicks ?? promotion.Clicks ?? 0;
  const clicksNumber = Number(clicksRaw);
  const clicks = Number.isFinite(clicksNumber) ? Math.max(0, Math.trunc(clicksNumber)) : 0;

  const link = promotion.link ?? promotion.Link ?? '';

  const ratingRaw = promotion.rating ?? promotion.Rating ?? 0;
  const ratingNumber = Number(ratingRaw);
  const rating = Number.isFinite(ratingNumber) ? Math.min(5, Math.max(0, ratingNumber)) : 0;

  const priceRaw = promotion.price ?? promotion.Price ?? 0;
  const priceNumber = Number(priceRaw);
  const price = Number.isFinite(priceNumber) ? Math.max(0, priceNumber) : 0;

  const discountRaw = promotion.discount ?? promotion.Discount ?? 0;
  const discountNumber = Number(discountRaw);
  const discount = Number.isFinite(discountNumber) ? Math.min(100, Math.max(0, discountNumber)) : 0;

  const rawImages = promotion.images ?? promotion.Images ?? promotion.image ?? promotion.Image ?? [];
  const images = asArray(rawImages).filter(Boolean);
  if (images.length === 0) images.push(defaultPromotion);

  const isLiked = Boolean(promotion.isLiked ?? promotion.IsLiked ?? promotion.liked ?? false);
  const createdById = promotion.createdById ?? promotion.createdByID ?? null;
  const editedByIds = promotion.editedByIds ?? promotion.editedByID ?? [];
  const deletedAt = promotion.deletedAt ?? promotion.deletedDate ?? null;
  const deletedById =
    promotion.deletedById ?? promotion.DeletedById ?? promotion.DeletedByID ?? promotion.deletedbyId ?? null;

  const canonical = {
    ...promotion,
    name: rawName,
    companyId,
    companyName,
    categories: asArray(categories),
    likes,
    clicks,
    link,
    rating,
    price,
    discount,
    images,
    isLiked,
    createdById,
    editedByIds: asArray(editedByIds),
    deletedAt,
    deletedById,
  };

  Object.assign(promotion, canonical);

  // Legacy aliases (keep current UI working)
  promotion.name ??= rawName;
  promotion.companyID ??= companyId;
  promotion.company ??= companyName;
  promotion.category ??= canonical.categories;
  promotion.Likes ??= likes;
  promotion.Clicks ??= clicks;
  promotion.Link ??= link;
  promotion.rating ??= rating;
  promotion.price ??= price;
  promotion.discount ??= discount;
  promotion.images ??= images;
  promotion.isLiked ??= isLiked;
  promotion.createdByID ??= createdById;
  promotion.editedByID ??= canonical.editedByIds;
  promotion.deletedDate ??= deletedAt;
  promotion.DeletedById ??= deletedById;

  return promotion;
};

const normalizeUser = (user) => {
  if (!user || typeof user !== 'object') return user;

  const subscribeStartDate = user.subscribeStartDate ?? user.subscribeStartedate ?? null;
  const subscribeEndDate = user.subscribeEndDate ?? user.subscribeEnddate ?? null;

  const rawLiked = user.likedPromotions ?? user.likedPromotion ?? user.LikedPromotion;
  const likedPromotions = Array.isArray(rawLiked) ? rawLiked : [];
  const followedCompanyIds = asArray(user.followedCompanyIds ?? user.followedCompanies ?? []).filter(
    (v) => typeof v === 'number'
  );

  const deletedAt = user.deletedAt ?? user.deletedDate ?? null;
  const deletedById = user.deletedById ?? user.deletedbyId ?? user.DeletedById ?? null;
  const createdById = user.createdById ?? user.createdByID ?? null;

  Object.assign(user, {
    subscribeStartDate,
    subscribeEndDate,
    likedPromotions,
    followedCompanyIds,
    deletedAt,
    deletedById,
    createdById,
  });

  // Legacy aliases
  user.subscribeStartedate ??= subscribeStartDate;
  if (subscribeEndDate != null) user.subscribeEnddate ??= subscribeEndDate;
  user.likedPromotion ??= likedPromotions;
  user.LikedPromotion ??= likedPromotions;
  user.followedCompanies ??= followedCompanyIds;
  if (deletedAt != null) user.deletedDate ??= deletedAt;
  if (deletedById != null) {
    user.deletedbyId ??= deletedById;
    user.DeletedById ??= deletedById;
  }
  if (createdById != null) user.createdByID ??= createdById;

  return user;
};

const normalizeCompany = (company) => {
  if (!company || typeof company !== 'object') return company;

  const companyLink = company.companyLink ?? company.CompanyLink ?? '';
  const createdById = company.createdById ?? company.createdByID ?? null;
  const subscribeStartDate = company.subscribeStartDate ?? company.subscribeStartedate ?? null;
  const subscribeEndDate = company.subscribeEndDate ?? company.subscribeEnddate ?? null;
  const permissions = company.permissions ?? company.permission ?? { canEdit: false, canDelete: false, canAdd: false };

  Object.assign(company, {
    companyLink,
    createdById,
    subscribeStartDate,
    subscribeEndDate,
    permissions,
  });

  // Legacy aliases
  company.CompanyLink ??= companyLink;
  if (createdById != null) company.createdByID ??= createdById;
  company.subscribeStartedate ??= subscribeStartDate;
  if (subscribeEndDate != null) company.subscribeEnddate ??= subscribeEndDate;
  company.permission ??= permissions;

  // Normalize embedded promotions
  const promotions = asArray(company.promotions ?? company.Promotion ?? []);
  const deletedPromotionsArr = asArray(company.deletedPromotions ?? []);
  promotions.forEach((p) => normalizePromotion(p, company.id, company.companyName ?? company.name));
  deletedPromotionsArr.forEach((p) => normalizePromotion(p, company.id, company.companyName ?? company.name));
  company.promotions = promotions;
  company.Promotion ??= promotions;
  company.deletedPromotions = deletedPromotionsArr;

  return company;
};

// Apply normalization (mutates objects so existing references like assignedCompanies stay valid)
asArray(typeof LikedPromotions !== 'undefined' ? LikedPromotions : []).forEach((p) => normalizePromotion(p));
asArray(typeof companyData !== 'undefined' ? companyData : []).forEach((c) => normalizeCompany(c));
asArray(typeof usersData !== 'undefined' ? usersData : []).forEach((u) => normalizeUser(u));
asArray(typeof deletedUsersData !== 'undefined' ? deletedUsersData : []).forEach((u) => normalizeUser(u));

export default {
    companyData,
    adminData,
    allUsers,
    usersData,
    deletedUsersData,
    legalContent,
    sampleMessages,
    initialAds,
    initialPlans,
    subscriptionPlanPresets,
    TopHomePage,
    categories
};


