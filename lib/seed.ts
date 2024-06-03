import { Redis } from '@upstash/redis';
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
})

// List of countries
const countryList = [
  "Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", 
  "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", 
  "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", 
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", 
  "Bhutan", "Bolivia (Plurinational State of)", "Bonaire, Sint Eustatius and Saba", 
  "Bosnia and Herzegovina", "Botswana", "Bouvet Island", "Brazil", 
  "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", 
  "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Cayman Islands", 
  "Central African Republic", "Chad", "Chile", "China", "Christmas Island", 
  "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo (the Democratic Republic of the)", 
  "Congo", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Curaçao", "Cyprus", 
  "Czechia", "Côte d'Ivoire", "Denmark", "Djibouti", "Dominica", "Dominican Republic", 
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", 
  "Eswatini", "Ethiopia", "Falkland Islands [Malvinas]", "Faroe Islands", "Fiji", 
  "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", 
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", 
  "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", 
  "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands", "Holy See", 
  "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", 
  "Iran (Islamic Republic of)", "Iraq", "Ireland", "Isle of Man", "Israel", 
  "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", 
  "Kiribati", "Korea (the Democratic People's Republic of)", "Korea (the Republic of)", 
  "Kuwait", "Kyrgyzstan", "Lao People's Democratic Republic", "Latvia", "Lebanon", 
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", 
  "Macao", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", 
  "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", 
  "Micronesia (Federated States of)", "Moldova (the Republic of)", "Monaco", 
  "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", 
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia", "New Zealand", 
  "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", 
  "Norway", "Oman", "Pakistan", "Palau", "Palestine, State of", "Panama", 
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", 
  "Portugal", "Puerto Rico", "Qatar", "Republic of North Macedonia", "Romania", 
  "Russian Federation", "Rwanda", "Réunion", "Saint Barthélemy", 
  "Saint Helena, Ascension and Tristan da Cunha", "Saint Kitts and Nevis", 
  "Saint Lucia", "Saint Martin (French part)", "Saint Pierre and Miquelon", 
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", 
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", 
  "Sint Maarten (Dutch part)", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", 
  "South Africa", "South Georgia and the South Sandwich Islands", "South Sudan", 
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Svalbard and Jan Mayen", "Sweden", 
  "Switzerland", "Syrian Arab Republic", "Taiwan", "Tajikistan", 
  "Tanzania, United Republic of", "Thailand", "Timor-Leste", "Togo", "Tokelau", 
  "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", 
  "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", 
  "United Kingdom of Great Britain and Northern Ireland", "United States Minor Outlying Islands", 
  "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", 
  "Viet Nam", "Virgin Islands (British)", "Virgin Islands (U.S.)", "Wallis and Futuna", 
  "Western Sahara", "Yemen", "Zambia", "Zimbabwe", "Åland Islands"
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const processCountry = async (country: string) => {
  const term = country.toUpperCase();
  const terms: { score: 0, member: string }[] = [];

  for (let i = 0; i <= term.length; i++) {
    terms.push({ score: 0, member: term.substring(0, i) });
  }
  // Makes the final term searchable
  terms.push({ score: 0, member: term + "*" });

  // REDIS sorted sets
  //@ts-expect-error
  await redis.zadd("terms", ...terms);
};

//avoid max heap allocation

const batchSize = 10; // Process 10 countries at a time
const batchDelay = 1000; // 1 second delay between batches

const processAllCountries = async () => {
  for (let i = 0; i < countryList.length; i += batchSize) {
    const batch = countryList.slice(i, i + batchSize);
    await Promise.all(batch.map(processCountry));
    console.log(`Processed batch ${i / batchSize + 1}`);
    await delay(batchDelay);
  }
};

processAllCountries().then(() => {
  console.log('All countries processed');
}).catch(error => {
  console.error('Error processing countries:', error);
});
