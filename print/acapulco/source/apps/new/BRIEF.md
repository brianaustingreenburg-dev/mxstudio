# Brief: find real restaurants in Acapulco for MX Studio apps

Goal: find REAL sit-down restaurants and cafés (not street taco stands, not fondas charging tiny prices, NOT national/international chains like VIPS, Sanborns, Toks, Starbucks, Italianni's, Chili's, Applebee's, McDonald's, Burger King, Domino's, Carl's Jr, Wings Army, El Fogoncito, La Parroquia de Veracruz, Krispy Kreme, Cielito Querido, Punta del Cielo, Potzollcalli). Local independents and local Acapulco multi-branch places are fine. They should look like they could pay ~$2,000 MXN for an app: decent ratings, real dining room/terrace, mid-to-upscale prices (Google price level 2+), many reviews.

ALREADY DONE — skip these: Buzos Costera, Jumil Café y Cocina, El Amigo Miguel, Punto 55, Emilia Café, Café al Mar, Antigua Acapulco, Terraza Buffet, Narciso, Don Camarón, La Casa del Mar, Celeste Beach House, Mary de Revolcadero, Mariscos El Sirenito, Paititi del Mar, Café Acapulco Caféba, Zabesu Barra Vieja, Cira La Morena (1 and 2), Mariscos Catamarán, The Cauldron Wizard's Coffee, La Casa de los Abuelos, Café Wadi, El Tío Markos, ALTAMAR, Tres Marías, La Choza de la Freed. Also skip hotel restaurants inside big resorts unless they operate as a standalone restaurant open to the public with their own entrance.

PRIORITY: places whose REAL menu with prices is findable online (Rappi rappi.com.mx, DiDi Food, Uber Eats, their own website/PDF menu, restaurantguru, tripadvisor menu, vagabundeando-type blogs). Rank candidates: (1) real menu+prices found, (2) high review count, (3) rating.

STEPS
1. Discover candidates with the places_search tool (mcp__widgets__places_search; load it with ToolSearch "select:mcp__widgets__places_search" if needed). Use several queries for your area (e.g. "mariscos restaurante <zona> Acapulco", "restaurante italiano Acapulco <zona>", "steakhouse Acapulco", "café de especialidad Acapulco <zona>", "restaurante con vista Acapulco <zona>", "sushi Acapulco <zona>", "restaurante mexicano <zona> Acapulco"). Collect ~25 candidates with place_id, name, lat, lng, address, phone, weekday_hours, rating, rating_count, price_level. Never display results with a map tool; just use the data.
2. For the most promising ~18, search for their real menu + prices (WebSearch mode standard; extended if thin; WebFetch). Max ~5 tool calls per place. Never use curl.
3. Pick your best 13 (real menu first). For each, write /home/claude/routes/new/<slug>.json (slug = lowercase-hyphen name, ascii only, unique; prefix nothing). Exact shape:
{"name":"","slug":"","area":"<your area label>","place_id":"","lat":0,"lng":0,"address":"street + colonia, short, no postal code/city","phone":"+52 744 ... or empty","hours":{"es":"Lun–Dom 9:00–22:00 compact","en":"Mon–Sun 9am–10pm"},"rating":4.5,"reviews":1234,"price_level":2,
 "kind":"mar|res|cafe","cuisine":"short english e.g. seafood, italian, steakhouse, sushi, mexican, café",
 "source":"real|partial|sample","sources":["urls"],
 "tagline":{"es":"short line","en":"short line"},"specialty":"one english line",
 "signature":["4 Spanish item names exactly as in menu — most photogenic signature dishes/drinks"],
 "photo_notes":{"cover":"1 sentence describing the restaurant look/vibe/setting for an AI photo (no text, no logos)","s1":"dish description for photo","s2":"...","s3":"...","s4":"..."},
 "menu":[{"cat":{"es":"","en":""},"items":[{"name":{"es":"","en":""},"desc":{"es":"","en":""},"price":"185"}]}]}
Menu rules: 3–6 categories, 12–24 items, real names & prices where found (estimate missing prices from the place's other real prices; if nothing found, write a believable menu for that place and set source "sample"). Prices plain MXN strings. Every name/desc in Spanish AND English (Mexican dish names may stay Spanish). desc < 60 chars (may be ""). Signature names must exactly match menu item Spanish names. No trademarked franchise names.
4. Validate each file with python3 json.load. Final reply: one line per file: slug | name | source | #verified prices | reviews. Nothing else.
