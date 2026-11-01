# Acapulco live apps (26) ✝

Menus re-researched Oct 31 2026 (2nd pass): 9 real, 15 partial (real dishes, estimated prices), 2 nothing online. Don Camarón prices from a 2021 menu; Caféba / Casa de los Abuelos / Café al Mar / Narciso prices from Rappi (delivery prices can be higher).

Built Oct 31 2026. Each restaurant/café has its own live app at go.myjefetech.app/acapulco/c/<name>/ — real phone, hours, address (Google), researched menu & prices, AI photos.
Before activation: list-for-the-waiter on, WhatsApp orders/reservations off, WiFi hidden. Call button uses their real phone.

**Activate (Brian, no Claude, no Git, no key, works offline):** Rutas → place → ⚙️ Activar → owner's WhatsApp, exact WiFi name/password, options → ✅ Crear su app. Settings are built into the link (c/<name>/?a=<base64 JSON {w,n,p,o}>). Rutas shows the QR on screen, a 📲 send-to-owner WhatsApp message, and the printable card. Saved on Brian's phone (localStorage mx-act-<name>). Anyone opening the plain link without ?a gets the un-activated version — always give out the activated link/QR.
**Cards:** acapulco/tarjeta/?s=<name>&a=<settings> builds the 5×7 card on the phone (letter page, cut marks, front QR = activated link, back = top dishes, WiFi, address, phone, hours) → Print/PDF. Rutas → 🖨️ Tarjeta 5×7 uses saved activation. Static tarjeta-5x7.pdf in each folder = un-activated version.
**Menu/price/photo changes** still need Claude (or free Claude: read the menu photo, then edit acapulco/c/<name>/index.html data) — tools in print/acapulco/source/apps (gen_apps.py → gen_live.py).

| # | Place | Link | Menu |
|---|---|---|---|
| 1 | Buzos Costera | https://go.myjefetech.app/acapulco/c/buzos-costera/ | partial |
| 2 | Jumil Café y Cocina | https://go.myjefetech.app/acapulco/c/jumil-cafe/ | sample |
| 3 | El Amigo Miguel | https://go.myjefetech.app/acapulco/c/el-amigo-miguel/ | real |
| 4 | Punto 55 | https://go.myjefetech.app/acapulco/c/punto-55/ | real |
| 5 | Emilia Café | https://go.myjefetech.app/acapulco/c/emilia-cafe/ | real |
| 6 | Café al Mar | https://go.myjefetech.app/acapulco/c/cafe-al-mar/ | real |
| 7 | Antigua Acapulco | https://go.myjefetech.app/acapulco/c/antigua-acapulco/ | real |
| 8 | Terraza Buffet | https://go.myjefetech.app/acapulco/c/terraza-buffet/ | partial |
| 9 | Narciso | https://go.myjefetech.app/acapulco/c/narciso/ | partial |
| 10 | Don Camarón | https://go.myjefetech.app/acapulco/c/don-camaron/ | real |
| 11 | La Casa del Mar | https://go.myjefetech.app/acapulco/c/la-casa-del-mar/ | partial |
| 12 | Celeste Beach House | https://go.myjefetech.app/acapulco/c/celeste-beach-house/ | partial |
| 13 | Mary de Revolcadero | https://go.myjefetech.app/acapulco/c/mary-de-revolcadero/ | partial |
| 14 | Mariscos El Sirenito | https://go.myjefetech.app/acapulco/c/mariscos-el-sirenito/ | partial |
| 15 | Paititi del Mar | https://go.myjefetech.app/acapulco/c/paititi-del-mar/ | partial |
| 16 | Café Acapulco Caféba | https://go.myjefetech.app/acapulco/c/cafe-acapulco-cafeba/ | real |
| 17 | Zabesu Barra Vieja | https://go.myjefetech.app/acapulco/c/zabesu-barra-vieja/ | partial |
| 18 | Cira La Morena 1 | https://go.myjefetech.app/acapulco/c/cira-la-morena/ | real |
| 19 | Mariscos Catamarán | https://go.myjefetech.app/acapulco/c/mariscos-catamaran/ | partial |
| 20 | The Cauldron Wizard's Coffee | https://go.myjefetech.app/acapulco/c/the-cauldron/ | partial |
| 21 | La Casa de los Abuelos | https://go.myjefetech.app/acapulco/c/casa-de-los-abuelos/ | real |
| 22 | Café Wadi | https://go.myjefetech.app/acapulco/c/cafe-wadi/ | partial |
| 23 | Restaurant El Tío Markos | https://go.myjefetech.app/acapulco/c/el-tio-markos/ | partial |
| 24 | ALTAMAR restaurante y jardín | https://go.myjefetech.app/acapulco/c/altamar/ | sample |
| 25 | Tres Marías Restaurante | https://go.myjefetech.app/acapulco/c/tres-marias/ | partial |
| 26 | La Choza de la Freed | https://go.myjefetech.app/acapulco/c/la-choza-de-la-freed/ | partial |
## Added Nov 1 2026: 50 more (routes 4–9 + 2 on route 3) — 76 apps total
Found by area search (real sit-down places, no chains), real menus prioritized. Rutas shows ✅ Menú real · Ready to sell / ⚠️ Menú por confirmar, and a ✅ Listas filter.

| Route | Place | Link | Menu |
|---|---|---|---|
| 3 | La Cabañita | https://go.myjefetech.app/acapulco/c/la-cabanita-pie-de-la-cuesta/ | sample |
| 3 | Restaurante 2 Vistas Tortugario | https://go.myjefetech.app/acapulco/c/dos-vistas-tortugario/ | sample |
| 4 | La Cabaña de Caleta | https://go.myjefetech.app/acapulco/c/la-cabana-de-caleta/ | partial |
| 4 | Mesón de los Ángeles | https://go.myjefetech.app/acapulco/c/meson-de-los-angeles/ | real |
| 4 | Meztizza Restaurante | https://go.myjefetech.app/acapulco/c/meztizza-restaurante/ | sample |
| 4 | Mi Piaci | https://go.myjefetech.app/acapulco/c/mi-piaci/ | real |
| 4 | Restaurante La Fogata | https://go.myjefetech.app/acapulco/c/la-fogata-acapulco/ | sample |
| 4 | El Anzuelo | https://go.myjefetech.app/acapulco/c/el-anzuelo/ | sample |
| 4 | Bonsai Sushi | https://go.myjefetech.app/acapulco/c/bonsai-sushi-hornos/ | sample |
| 4 | El Nono | https://go.myjefetech.app/acapulco/c/el-nono/ | real |
| 4 | La Buena Onda Seafood Restaurant | https://go.myjefetech.app/acapulco/c/la-buena-onda-seafood/ | sample |
| 5 | Bocana Beach Papagayo | https://go.myjefetech.app/acapulco/c/bocana-beach-papagayo/ | sample |
| 5 | Restaurante La Unión | https://go.myjefetech.app/acapulco/c/restaurante-la-union-papagayo/ | sample |
| 5 | La Casa del Marisco | https://go.myjefetech.app/acapulco/c/la-casa-del-marisco-magallanes/ | sample |
| 5 | El Zorrito | https://go.myjefetech.app/acapulco/c/el-zorrito/ | real |
| 5 | La Barra 520 | https://go.myjefetech.app/acapulco/c/la-barra-520/ | real |
| 5 | Forza Italia Ristorante | https://go.myjefetech.app/acapulco/c/forza-italia-ristorante/ | partial |
| 5 | Restaurante El Cabrito | https://go.myjefetech.app/acapulco/c/el-cabrito-acapulco/ | partial |
| 5 | Che Pibe | https://go.myjefetech.app/acapulco/c/che-pibe/ | partial |
| 5 | La Casa de Tere | https://go.myjefetech.app/acapulco/c/la-casa-de-tere/ | partial |
| 6 | Suntory Acapulco | https://go.myjefetech.app/acapulco/c/suntory-acapulco/ | partial |
| 6 | Questa Pasta | https://go.myjefetech.app/acapulco/c/questa-pasta/ | partial |
| 6 | Mariscos Pipo's Costa Azul | https://go.myjefetech.app/acapulco/c/mariscos-pipos-costa-azul/ | partial |
| 6 | Becco al Mare | https://go.myjefetech.app/acapulco/c/becco-al-mare/ | partial |
| 6 | Praya | https://go.myjefetech.app/acapulco/c/praya-acapulco/ | partial |
| 6 | Tony's Bistro Acapulco | https://go.myjefetech.app/acapulco/c/tonys-bistro-acapulco/ | real |
| 6 | Muna Acapulco | https://go.myjefetech.app/acapulco/c/muna-acapulco/ | real |
| 6 | Amalfi Acapulco | https://go.myjefetech.app/acapulco/c/amalfi-acapulco/ | real |
| 6 | Zibu Acapulco | https://go.myjefetech.app/acapulco/c/zibu-acapulco/ | real |
| 7 | Península Restaurantes | https://go.myjefetech.app/acapulco/c/peninsula-restaurantes/ | real |
| 7 | La Casa de la Pasta | https://go.myjefetech.app/acapulco/c/la-casa-de-la-pasta-diamante/ | sample |
| 7 | La Trainera - La Joya | https://go.myjefetech.app/acapulco/c/la-trainera-la-joya/ | real |
| 7 | La Fondita Acapulco Colosio | https://go.myjefetech.app/acapulco/c/la-fondita-acapulco-colosio/ | real |
| 7 | Mariscos El Plebe Alegre | https://go.myjefetech.app/acapulco/c/mariscos-el-plebe-alegre/ | sample |
| 7 | La Granja | https://go.myjefetech.app/acapulco/c/la-granja-diamante/ | partial |
| 7 | Celeiro Brazza Churrasqueria | https://go.myjefetech.app/acapulco/c/celeiro-brazza-churrasqueria/ | partial |
| 7 | La Finca Acapulco Diamante | https://go.myjefetech.app/acapulco/c/la-finca-acapulco-diamante/ | partial |
| 8 | RINOS Casa Napoli | https://go.myjefetech.app/acapulco/c/rinos-casa-napoli/ | real |
| 8 | La Jaiba Locca Diamante | https://go.myjefetech.app/acapulco/c/la-jaiba-locca-diamante/ | partial |
| 8 | Restaurante 7 Leguas Diamante | https://go.myjefetech.app/acapulco/c/restaurante-7-leguas-diamante/ | sample |
| 8 | Shu | https://go.myjefetech.app/acapulco/c/shu-acapulco/ | partial |
| 8 | Elcano Diamante Club de Playa | https://go.myjefetech.app/acapulco/c/elcano-diamante-club-de-playa/ | real |
| 8 | Restaurant Bar Compadre Noilo | https://go.myjefetech.app/acapulco/c/compadre-noilo-bonfil/ | sample |
| 8 | Las Gaviotas 2 | https://go.myjefetech.app/acapulco/c/las-gaviotas-2-bonfil/ | sample |
| 9 | Restaurant Bar Alejo Laguna | https://go.myjefetech.app/acapulco/c/alejo-laguna/ | sample |
| 9 | Restaurante Mocambo Barra Vieja | https://go.myjefetech.app/acapulco/c/mocambo-barra-vieja/ | sample |
| 9 | Las Palmerass Barra Vieja | https://go.myjefetech.app/acapulco/c/las-palmerass-barra-vieja/ | sample |
| 9 | Gloria del Mar | https://go.myjefetech.app/acapulco/c/gloria-del-mar-barra-vieja/ | partial |
| 9 | Tomasa Pescado a la Talla | https://go.myjefetech.app/acapulco/c/tomasa-pescado-a-la-talla/ | sample |
| 9 | Restaurante Juan y Eva | https://go.myjefetech.app/acapulco/c/juan-y-eva-barra-vieja/ | sample |