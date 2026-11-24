# Rutas WhatsApp leads

Goal: 7,000 independent (non-chain) Mexican businesses with a published WhatsApp number, each shown on
https://go.myjefetech.app/acapulco/rutas/whatsapp/ with its industry demo and a pitch button.

- `leads.json` — master list. Entries with `kind: "new"` are the leads. Fields: n, type, area, phone (52 + 10 digits), code, batch.
- `add.sh batch.txt N` — appends a pipe file (`Name|Type|Area, State|10-digit phone`), dedupes by phone.
- `publish.sh` — regenerates the page, updates the count on the Rutas hub, bumps the service worker cache, commits and pushes. GitHub Pages deploys in ~1–2 min.

Rules
- Only independent businesses. No chains, franchises, big resorts or hotel groups.
- Only numbers the business itself labels as WhatsApp (site, Instagram/TikTok/Facebook bio, "Reserva por WhatsApp"). Never directory customer-service numbers (e.g. ZonaTurística's own +52 55 6435 8003).
- Types: Hotel, Restaurante, Tour, Café, Bar, Spa, Salón, Boutique, Tienda, Club de playa.
- Area must end with the full state name (e.g. "Centro, Mérida, Yucatán") so the state filter works.

Good sources: business websites, zonaturistica.com ("WhatsApp del Hotel"), tourism-office directories like ocvguaymas.com, social bios.
Already covered (as of 2026-11-23): Guerrero, Puerto Escondido, Huatulco, Zipolite, Oaxaca city, Bacalar, Tulum, Holbox, Playa del Carmen, Isla Mujeres, Cancún, Mahahual, Mérida, Valladolid, Izamal, Celestún, San Cristóbal, Comitán, Tuxtla, Sayulita, San Pancho, Guayabitos, Bucerías, La Cruz, Puerto Vallarta, Mazatlán, La Paz, Loreto, San José del Cabo, Cabo San Lucas, San Carlos/Guaymas, Valle de Guadalupe, San Miguel de Allende, Guanajuato, Querétaro, Bernal, Cholula/Puebla, Cuetzalan, Zacatlán, Tepoztlán, Valle de Bravo, Malinalco, Cuernavaca, Pátzcuaro, Morelia, Zacatecas, Xilitla, Ciudad Valles, Xalapa, Coatepec, Boca del Río, Campeche, Ajijic, Mazamitla, Tlaquepaque, Monterrey/Santiago, Creel, Guadalajara (Americana), CDMX (Condesa/Roma).
