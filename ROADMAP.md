# testAR Roadmap

## v0.1.0
- [x] WebXR proof-of-concept
- [x] hit-test
- [x] plaatsbare vulkaan

## v0.2.0
- [x] procedurele eruptie
- [x] lava/deeltjes
- [x] technische AR-keten bevestigd op toestel
- [x] vastgesteld: visual fidelity onvoldoende

## v0.3.0
- [x] volledig nieuwe vulkaangeometrie
- [x] procedurele rock textures
- [x] bump mapping
- [x] echte 3D lava-tubes
- [x] gelaagde rook
- [x] ejecta
- [x] dynamisch eruptielicht
- [x] standaard kleinere schaal
- [ ] fysieke Android visual-fidelity test

## Volgende indien nodig
- [ ] extern high-poly GLB-vulkaanmodel
- [ ] echte PBR texture maps (albedo/normal/roughness)
- [ ] betere volumetrische rook
- [ ] lavaflow over gedetecteerd vlak
- [ ] eruption audio / spatial audio
- [ ] environment light estimation


## v0.3.1 — Android reference-space fix
- [x] oorzaak AR-startregressie gelokaliseerd
- [x] Three.js default `local-floor` niet langer gebruikt
- [x] Three.js XR reference space geforceerd naar `local`
- [x] renderer en placement delen exact dezelfde reference space
- [ ] fysieke Android AR-start opnieuw testen
- [ ] daarna visual-fidelity test van v0.3.x hervatten


## v0.3.2 — Raw-WebXR compatibility bridge
- [x] v0.3.1 als mislukte fix geregistreerd
- [x] werkende v0.2.0 reference-spacegedrag als technische referentie genomen
- [x] `local-floor` aanvragen van Three.js worden onderschept
- [x] effectieve aanvraag naar toestel is `local`
- [x] `viewer` blijft voor hit-test
- [x] renderer en placement delen dezelfde XRReferenceSpace
- [ ] fysieke Android AR-start
- [ ] hit-test
- [ ] plaatsing
- [ ] visual-fidelity test
