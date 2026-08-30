# testAR v0.3.1 — TESTING

## Automatisch uitgevoerd
- [x] vereiste bestanden aanwezig
- [x] relatieve lokale imports gecontroleerd
- [x] README aanwezig
- [x] ROADMAP aanwezig
- [x] TESTING aanwezig
- [x] BUILD_VALIDATION aanwezig

## Niet lokaal automatisch testbaar
- [ ] jsDelivr beschikbaar op telefoon/netwerk
- [ ] Three.js module laadt via GitHub Pages
- [ ] WebXR immersive-ar
- [ ] ARCore hit-test

## Fysieke Android testvolgorde
1. Open https://gasvdv-lab.github.io/testAR/
2. Controleer v0.3.0.
3. Laat schaal eerst op 45%.
4. Start AR.
5. Scan een tafel of vlak stuk grond.
6. Controleer of witte ring verschijnt.
7. Plaats vulkaan.
8. Controleer of vulkaan duidelijk kleiner en realistischer is dan v0.2.0.
9. Bekijk van dichtbij en schuin van boven.
10. Controleer rotsstructuur/oneffenheden.
11. Controleer krater.
12. Controleer dat lavastromen dikte hebben i.p.v. rode lijnen.
13. Controleer rook.
14. Controleer ejecta.
15. Loop rond vulkaan en controleer anchoring.
16. Zet eruptiekracht voor volgende run lager/hoger.
17. Test reset.
18. Sluit AR.
19. Start AR opnieuw zonder pagina-refresh.

## Succescriterium
v0.3.0 is visueel geslaagd wanneer de vulkaan niet langer als een kale geometrische kegel/wireframe-effect oogt en de eruptie als een duidelijk 3D tafeldiorama wordt ervaren.


## v0.3.1 regressietest — reference space
- [x] codecontrole: `setReferenceSpaceType('local')` staat vóór `renderer.xr.setSession()`
- [x] codecontrole: render reference space wordt via `renderer.xr.getReferenceSpace()` hergebruikt
- [x] codecontrole: hit-test source blijft gebaseerd op `viewer`
- [x] lokale JS-syntax gecontroleerd
- [ ] Android: Start AR geeft GEEN `requestReferenceSpace` fout meer
- [ ] Android: camerabeeld opent
- [ ] Android: witte hit-test ring verschijnt
- [ ] Android: vulkaan kan geplaatst worden
- [ ] Android: vulkaan blijft ruimtelijk verankerd
- [ ] Android: reset werkt
- [ ] Android: sluiten en opnieuw starten werkt

### Eerst uitvoeren
Test vóór alle visuele beoordeling uitsluitend:
1. Start AR.
2. Controleer dat de oude reference-space fout verdwenen is.
3. Zoek een vlak.
4. Plaats de vulkaan.
5. Stuur een screenshot van het resultaat.
