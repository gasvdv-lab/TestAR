# testAR — v0.3.1 Reference-Space Compatibility Fix

## Vaste app-link
https://gasvdv-lab.github.io/testAR/

## Doel
v0.3.0 vervangt de simpele procedurele kegel uit v0.2.0 door een veel rijkere AR-vulkaan met onregelmatige mesh, PBR-achtige rotsmaterialen, krater, lava, rook en vulkanische ejecta.

## Belangrijk
Deze build blijft volledig browsergebaseerd. Er is geen APK nodig.

## Nieuw
- grillige, radiaal opgebouwde vulkaanmesh
- kraterdepressie en donkere kraterrand
- procedurele rock texture
- procedurele bump texture
- MeshStandardMaterial voor rots
- 9 echte 3D lava-tubes
- emissieve lava
- dynamische orange point-light
- 42 transparante rooklagen
- 95 gloeiende ejecta/deeltjes
- 85 losse rotsblokken rond de voet
- kleinere realistischere standaardschaal: 45%
- eruptiekracht instelbaar
- hit-test reticle
- reset + XR cleanup

## Dependency
Three.js 0.180.0 via jsDelivr.

## Installatie
Upload de volledige INHOUD van deze ZIP naar repository `testAR`.
GitHub Pages:
Settings → Pages → Deploy from branch → main → /(root)

Open daarna:
https://gasvdv-lab.github.io/testAR/


## v0.3.1 fix — Android WebXR reference space

### Probleem in v0.3.0
Op het fysieke Android-toestel startte de immersive AR-session, maar Three.js probeerde tijdens `renderer.xr.setSession()` zijn standaard reference space `local-floor` aan te vragen. Het toestel ondersteunde die reference-spacevariant in deze sessie niet en gaf:

`Failed to execute 'requestReferenceSpace' on 'XRSession': This device does not support the requested reference space type.`

### Oorzaak
v0.2.0 gebruikte rechtstreeks `requestReferenceSpace('local')` en werkte op hetzelfde toestel. v0.3.0 stapte over op Three.js; Three.js gebruikt standaard `local-floor` tenzij dit vóór `setSession()` wordt gewijzigd.

### Fix
v0.3.1:
1. stelt `renderer.xr.setReferenceSpaceType('local')` in vóór `setSession()`;
2. gebruikt daarna `renderer.xr.getReferenceSpace()` als gedeelde world reference space;
3. gebruikt `viewer` uitsluitend als bron voor hit-testing;
4. houdt plaatsing, rendering en hit-testresultaten in hetzelfde coördinatenstelsel.

De vulkaangeometrie, textures, lava, rook en ejecta uit v0.3.0 zijn verder niet gewijzigd.
