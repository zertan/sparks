# Unity desert runner rendering setup

This project now includes guidance and starter assets for recreating the desert runner vignette inside Unity with a bright, high-atmosphere look. The focus is on lighting, perspective, and post-processing (global illumination, depth of field, fog, bloom, and color grading) so the character feels silhouetted against a glowing horizon with limited visibility.

## Quick start
1. Create a new **URP** project in Unity 2022.3+.
2. Copy the `Assets` folder from this repository's `unity/` directory into your Unity project's `Assets` directory.
3. Open your main scene and add the **AtmosphereSetup** component (under `Assets/Scripts`) to an empty GameObject. Drag your main camera into the `Target Camera` field.
4. Add a **Global Volume** (if one is not already created, AtmosphereSetup can spawn one). Use the provided component to seed bloom, color, fog, depth of field, and exposure settings; tweak values in the Inspector to taste.

## Visual targets
- **Global illumination / bounce:** use URP's forward rendering with ambient mode set to **Gradient** or **Skybox**; the component lifts exposure and applies warm midtones to keep sand and fog glowing.
- **Perspective framing:** position the camera slightly above and left of the character, looking down and right; AtmosphereSetup nudges FOV to 60° by default for a cinematic third-person view.
- **Depth of field:** the script configures a shallow DOF with a distant focal length so near objects stay crisp while the horizon softens.
- **Fog and horizon glow:** atmospheric fog is enabled with a short range so the far dunes dissolve into mist, matching the red glow of the background.
- **Sparks and emissives:** add particle systems for character and worm effects; keep emissive colors cyan/blue-green for contrast against the red sand. Enable bloom so emissive sparks halo correctly.

## Scene assembly tips
- **Sand plane:** start with a large mesh plane using a tiling sand normal; reduce smoothness to keep it matte under the red ambient light.
- **Character and sword:** orient the sword diagonally back; add a small emissive map or particles near the blade tip for the spark cloud.
- **Golden worms:** use skinned meshes or simple segmented meshes; attach particle emitters with additive blue-green sparks to their jump arcs.

## Controls (suggested)
- WASD/left stick for movement, mouse/right stick for camera orbit with a clamped vertical angle, and Shift for sprint. Use Cinemachine's FreeLook rig if available.

## Lighting knobs exposed by the script
- **Exposure** for overall brightness
- **Bloom threshold/intensity** for horizon glow
- **Fog color/density** to match the bright red mist
- **Depth of field focus/distance** so the foreground stays clear while distant dunes blur
- **Midtone lift** to keep the sand from turning black when silhouetted

Feel free to adjust the `AtmosphereSetup` values in play mode until the scene matches the desired high-bright, foggy look.
