export const CATEGORIES = [
  { value: 'plumber', label: 'Plumber', urdu: 'پلمبر', icon: '🔧' },
  { value: 'electrician', label: 'Electrician', urdu: 'الیکٹریشن', icon: '⚡' },
  { value: 'carpenter', label: 'Carpenter', urdu: 'بڑھئی', icon: '🪚' },
  { value: 'tutor', label: 'Tutor', urdu: 'ٹیوٹر', icon: '📚' },
  { value: 'cleaner', label: 'Cleaner', urdu: 'صفائی', icon: '🧹' },
  { value: 'ac_repair', label: 'AC Repair', urdu: 'اے سی مکینک', icon: '❄️' },
  { value: 'painter', label: 'Painter', urdu: 'رنگ ساز', icon: '🎨' },
  { value: 'tailor', label: 'Tailor', urdu: 'درزی', icon: '✂️' },
  { value: 'appliance_repair', label: 'Appliance Repair', urdu: 'مکینک', icon: '🔩' },
  { value: 'beautician', label: 'Beautician', urdu: 'بیوٹیشن', icon: '💅' },
]

export const CITIES: Record<string, string[]> = {
  Lahore: [
    'DHA', 'Gulberg', 'Johar Town', 'Model Town', 'Bahria Town',
    'Cantt', 'Iqbal Town', 'Faisal Town', 'Garden Town', 'Township',
    'Wapda Town', 'Allama Iqbal Town', 'Shadman', 'Samanabad', 'Other',
  ],
  Karachi: [
    'DHA', 'Clifton', 'Gulshan-e-Iqbal', 'North Nazimabad', 'Federal B Area',
    'Korangi', 'Malir', 'Landhi', 'Gulistan-e-Jauhar', 'Bahria Town',
    'PECHS', 'Saddar', 'Liaquatabad', 'New Karachi', 'Other',
  ],
  Islamabad: [
    'F-6', 'F-7', 'F-8', 'F-10', 'F-11',
    'G-9', 'G-10', 'G-11', 'G-13', 'Bahria Town',
    'DHA', 'E-7', 'E-11', 'I-8', 'Other',
  ],
  Hyderabad: [
    'Latifabad', 'Qasimabad', 'Hirabad', 'Saddar', 'City',
    'Pakka Qila', 'Naseem Nagar', 'Hussainabad', 'Auto Bhan Road', 'Other',
  ],
}

export const ADMIN_WHATSAPP = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '923001234567'
export const ADMIN_PAYMENT_NUMBER = process.env.NEXT_PUBLIC_ADMIN_PAYMENT_NUMBER || '03001234567'

// Pricing (PKR)
export const BOOST_PRICE_WEEKLY = 50
export const VERIFIED_PRICE_MONTHLY = 100

// Durations (days)
export const FREE_TRIAL_DAYS = 14
export const BOOST_DURATION_DAYS = 7
export const VERIFIED_DURATION_DAYS = 30

// Limits
export const MAX_PORTFOLIO_PHOTOS = 10
export const MAX_FILE_SIZE_MB = 5

// Payment methods shown in upgrade modal
export const PAYMENT_METHODS = [
  { value: 'easypaisa', label: 'Easypaisa', icon: '💰' },
  { value: 'jazzcash', label: 'JazzCash', icon: '📱' },
  { value: 'bank', label: 'Bank Transfer', icon: '🏦' },
]
