using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

[ExecuteAlways]
public class AtmosphereSetup : MonoBehaviour
{
    [Header("Camera")]
    public Camera targetCamera;
    [Range(10f, 90f)] public float fieldOfView = 60f;

    [Header("Exposure & Color")]
    [Range(-2f, 4f)] public float exposure = 1.2f;
    [Range(-0.5f, 0.5f)] public float midtoneLift = 0.15f;
    public Color fogColor = new Color(0.8f, 0.15f, 0.15f, 1f);

    [Header("Fog Range")]
    public float fogStart = 5f;
    public float fogEnd = 40f;

    [Header("Bloom")]
    [Range(0.5f, 2f)] public float bloomThreshold = 1f;
    [Range(0f, 5f)] public float bloomIntensity = 1.8f;

    [Header("Depth of Field")]
    public float focusDistance = 12f;
    [Range(0.1f, 20f)] public float aperture = 5f;
    [Range(0.1f, 300f)] public float focalLength = 80f;

    [Header("Volume Reference")]
    public Volume globalVolume;

    private ColorAdjustments _colorAdjustments;
    private LiftGammaGain _liftGamma;
    private Bloom _bloom;
    private DepthOfField _dof;

    private void Reset()
    {
        if (targetCamera == null && Camera.main != null)
            targetCamera = Camera.main;

        if (globalVolume == null)
        {
            var go = new GameObject("Atmosphere Volume");
            go.transform.SetParent(transform);
            globalVolume = go.AddComponent<Volume>();
            globalVolume.isGlobal = true;
            globalVolume.priority = 10f;
            globalVolume.sharedProfile = ScriptableObject.CreateInstance<VolumeProfile>();
        }
    }

    private void OnEnable()
    {
        ApplySettings();
    }

    private void OnValidate()
    {
        ApplySettings();
    }

    private void ApplySettings()
    {
        if (targetCamera != null)
        {
            targetCamera.fieldOfView = fieldOfView;
            targetCamera.nearClipPlane = 0.05f;
            targetCamera.farClipPlane = Mathf.Max(fogEnd + 10f, 100f);
        }

        // Fog and horizon atmosphere
        RenderSettings.fog = true;
        RenderSettings.fogColor = fogColor;
        RenderSettings.fogMode = FogMode.Linear;
        RenderSettings.fogStartDistance = fogStart;
        RenderSettings.fogEndDistance = fogEnd;

        if (globalVolume == null)
            return;

        var profile = globalVolume.sharedProfile != null ? globalVolume.sharedProfile : globalVolume.profile;
        if (profile == null)
        {
            profile = ScriptableObject.CreateInstance<VolumeProfile>();
            globalVolume.sharedProfile = profile;
        }

        EnsureOverride(profile, ref _colorAdjustments);
        EnsureOverride(profile, ref _liftGamma);
        EnsureOverride(profile, ref _bloom);
        EnsureOverride(profile, ref _dof);

        if (_colorAdjustments != null)
        {
            _colorAdjustments.postExposure.Override(exposure);
        }

        if (_liftGamma != null)
        {
            var lift = new Vector4(midtoneLift, midtoneLift, midtoneLift, 0f);
            _liftGamma.lift.Override(lift);
        }

        if (_bloom != null)
        {
            _bloom.threshold.Override(bloomThreshold);
            _bloom.intensity.Override(bloomIntensity);
        }

        if (_dof != null)
        {
            _dof.mode.Override(DepthOfFieldMode.Bokeh);
            _dof.focusDistance.Override(focusDistance);
            _dof.aperture.Override(aperture);
            _dof.focalLength.Override(focalLength);
        }
    }

    private void EnsureOverride<T>(VolumeProfile profile, ref T component) where T : VolumeComponent, new()
    {
        if (!profile.TryGet(out component))
        {
            component = profile.Add<T>(true);
        }
    }
}
