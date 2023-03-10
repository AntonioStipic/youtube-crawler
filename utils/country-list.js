const countries = {
    'Afghanistan': 'AF',
    'Åland Islands': 'AX',
    'Albanija': 'AL',
    'Alžir': 'DZ',
    'Američka Samoa': 'AS',
    'Andora': 'AD',
    'Angola': 'AO',
    'Anguilla': 'AI',
    'Antarktika': 'AQ',
    'Antigva i Barbuda': 'AG',
    'Argentina': 'AR',
    'Armenija': 'AM',
    'Aruba': 'AW',
    'Australija': 'AU',
    'Austrija': 'AT',
    'Azerbajdžan': 'AZ',
    'Bahami': 'BS',
    'Bahrein': 'BH',
    'Bangladeš': 'BD',
    'Barbados': 'BB',
    'Bjelorusija': 'BY',
    'Belgija': 'BE',
    'Belize': 'BZ',
    'Benin': 'BJ',
    'Bermuda': 'BM',
    'Butan': 'BT',
    'Bolivija': 'BO',
    'Bosna i Hercegovina': 'BA',
    'Bocvana': 'BW',
    'Bouvet Island': 'BV',
    'Brazil': 'BR',
    'Britanski Indijskooceanski Teritorij': 'IO',
    'Brunej': 'BN',
    'Bugarska': 'BG',
    'Burkina Faso': 'BF',
    'Burundi': 'BI',
    'Kambodža': 'KH',
    'Kamerun': 'CM',
    'Kanada': 'CA',
    'Zelenortska Republika': 'CV',
    'Kajmanski Otoci': 'KY',
    'Centralna Afrička Republika': 'CF',
    'Čad': 'TD',
    'Čile': 'CL',
    'Kina': 'CN',
    'Božićni Otok': 'CX',
    'Kokosovi Otoci': 'CC',
    'Kolumbija': 'CO',
    'Komori': 'KM',
    'Kongo': 'CG',
    'Kongo, Demokratska Republika': 'CD',
    'Cookovi Otoci': 'CK',
    'Kostarika': 'CR',
    'Hrvatska': 'HR',
    'Kuba': 'CU',
    'Cipar': 'CY',
    'Češka': 'CZ',
    'Danska': 'DK',
    'Džibuti': 'DJ',
    'Dominika': 'DM',
    'Dominikanska Republika': 'DO',
    'Ekvador': 'EC',
    'Egipat': 'EG',
    'El Salvador': 'SV',
    'Ekvatorijalna Gvineja': 'GQ',
    'Eritreja': 'ER',
    'Estonija': 'EE',
    'Etiopija': 'ET',
    'Falklandski Otoci': 'FK',
    'Farski Otoci': 'FO',
    'Fidži': 'FJ',
    'Finska': 'FI',
    'Francuska': 'FR',
    'Francuska Gvajana': 'GF',
    'Francuska Polinezija': 'PF',
    'Francuski Južni Teritoriji': 'TF',
    'Gabon': 'GA',
    'Gambija': 'GM',
    'Gruzija': 'GE',
    'Njemačka': 'DE',
    'Gana': 'GH',
    'Gibraltar': 'GI',
    'Grčka': 'GR',
    'Grenland': 'GL',
    'Grenada': 'GD',
    'Gvadelupe': 'GP',
    'Guam': 'GU',
    'Gvatemala': 'GT',
    'Gvineja': 'GN',
    'Gvineja Bisau': 'GW',
    'Gvajana': 'GY',
    'Haiti': 'HT',
    'Otok Heard i McDonald': 'HM',
    'Vatikan': 'VA',
    'Honduras': 'HN',
    'Hong Kong': 'HK',
    'Mađarska': 'HU',
    'Island': 'IS',
    'Indija': 'IN',
    'Indonezija': 'ID',
    'Iran': 'IR',
    'Irak': 'IQ',
    'Irska': 'IE',
    'Izrael': 'IL',
    'Italija': 'IT',
    'Jamajka': 'JM',
    'Japan': 'JP',
    'Jordan': 'JO',
    'Kazahstan': 'KZ',
    'Kenija': 'KE',
    'Kirib i Tobi': 'KI',
    'Severna Koreja': 'KP',
    'Južna Koreja': 'KR',
    'Kuvajt': 'KW',
    'Kajmanski Otoci': 'KY',
    'Kazahstan': 'KZ',
    'Laos': 'LA',
    'Latvija': 'LV',
    'Libanon': 'LB',
    'Lesoto': 'LS',
    'Liberija': 'LR',
    'Libija': 'LY',
    'Lihtenštajn': 'LI',
    'Litva': 'LT',
    'Luksemburg': 'LU',
    'Makao': 'MO',
    'Makedonija': 'MK',
    'Madagaskar': 'MG',
    'Malavi': 'MW',
    'Malezija': 'MY',
    'Maldivi': 'MV',
    'Mali': 'ML',
    'Malta': 'MT',
    'Maršalovi Otoci': 'MH',
    'Martinik': 'MQ',
    'Mauritanija': 'MR',
    'Mauricijus': 'MU',
    'Majote': 'YT',
    'Meksiko': 'MX',
    'Mikronezija': 'FM',
    'Moldavija': 'MD',
    'Monako': 'MC',
    'Mongolija': 'MN',
    'Crna Gora': 'ME',
    'Montserrat': 'MS',
    'Maroko': 'MA',
    'Mozambik': 'MZ',
    'Mjanmar': 'MM',
    'Namibija': 'NA',
    'Nauru': 'NR',
    'Nepal': 'NP',
    'Nizozemska': 'NL',
    'Nizozemski Antili': 'AN',
    'Novi Kaledonija': 'NC',
    'Novi Zeland': 'NZ',
    'Nikaragva': 'NI',
    'Niger': 'NE',
    'Nigerija': 'NG',
    'Niue': 'NU',
    'Otok Norfolk': 'NF',
    'Sjeverne Marijanske Otoci': 'MP',
    'Norveška': 'NO',
    'Oman': 'OM',
    'Pakistan': 'PK',
    'Palau': 'PW',
    'Palestinsko Područje': 'PS',
    'Panama': 'PA',
    'Papua Nova Gvineja': 'PG',
    'Paragvaj': 'PY',
    'Peru': 'PE',
    'Filipini': 'PH',
    'Pitcairn': 'PN',
    'Poljska': 'PL',
    'Portugal': 'PT',
    'Portoriko': 'PR',
    'Katar': 'QA',
    'Reunion': 'RE',
    'Rumunjska': 'RO',
    'Rusija': 'RU',
    'Ruanda': 'RW',
    'Sveta Lucija': 'LC',
    'Sveta Helena': 'SH',
    'Sveta Kristina i Nevis': 'KN',
    'Sveta Lucija': 'LC',
    'Sveta Vincent i Grenadini': 'VC',
    'Samoa': 'WS',
    'San Marino': 'SM',
    'Sveti Toma i Princip': 'ST',
    'Saudijska Arabija': 'SA',
    'Senegal': 'SN',
    'Srbija': 'RS',
    'Sejšeli': 'SC',
    'Sijera Leone': 'SL',
    'Singapur': 'SG',
    'Slovačka': 'SK',
    'Slovenija': 'SI',
    'Solomonski Otoci': 'SB',
    'Somalija': 'SO',
    'Južna Afrika': 'ZA',
    'Južna Džordžija i Južni Sendvički Otoci': 'GS',
    'Španjolska': 'ES',
    'Šri Lanka': 'LK',
    'Sudan': 'SD',
    'Surinam': 'SR',
    'Svalbard i Jan Mayen': 'SJ',
    'Eswati': 'SZ',
    'Švedska': 'SE',
    'Švicarska': 'CH',
    'Sirija': 'SY',
    'Tajvan': 'TW',
    'Tadžikistan': 'TJ',
    'Tanzanija': 'TZ',
    'Tajland': 'TH',
    'Timor Leste': 'TL',
    'Togo': 'TG',
    'Tokelau': 'TK',
    'Tonga': 'TO',
    'Trinidad i Tobago': 'TT',
    'Tunis': 'TN',
    'Turska': 'TR',
    'Turkmenistan': 'TM',
    'Otoci Turks i Caicos': 'TC',
    'Tuvalu': 'TV',
    'Uganda': 'UG',
    'Ukrajina': 'UA',
    'Ujedinjeni Arapski Emirati': 'AE',
    'Ujedinjeno Kraljevstvo': 'GB',
    'Sjedinjene Američke Države': 'US',
    'SAD Minor Outlying Islands': 'UM',
    'Urugvaj': 'UY',
    'Uzbekistan': 'UZ',
    'Vanuatu': 'VU',
    'Vatikan': 'VA',
    'Venecuela': 'VE',
    'Vijetnam': 'VN',
    'Britanski Djevičanski Otoci': 'VG',
    'Američki Djevičanski Otoci': 'VI',
    'Wallis i Futuna': 'WF',
    'Zapadna Sahara': 'EH',
    'Jemen': 'YE',
    'Zambija': 'ZM',
    'Zimbabve': 'ZW'
}

exports.countries = countries;