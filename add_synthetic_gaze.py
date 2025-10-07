"""
Add synthetic gaze data to metadata for demo purposes
"""
import json
import random

def add_synthetic_gaze(metadata_path):
    """Add realistic gaze data to tracks"""

    with open(metadata_path, 'r') as f:
        data = json.load(f)

    tracks = data.get('tracks', [])

    print(f"Adding gaze data to {len(tracks)} tracks...")

    for track in tracks:
        track_id = track['track_id']

        # Generate realistic gaze angles
        # ~40% looking at camera, 60% not looking
        is_looking = random.random() < 0.4

        if is_looking:
            # Looking at camera: small angles
            yaw = random.uniform(-20, 20)
            pitch = random.uniform(-25, 25)
        else:
            # Not looking: larger angles
            yaw = random.uniform(-80, 80)
            pitch = random.uniform(-60, 60)

        # Add gaze data to track
        track['gaze_data'] = {
            'yaw_angle': round(yaw, 2),
            'pitch_angle': round(pitch, 2),
            'looking_at_camera': is_looking,
            'confidence': round(random.uniform(0.7, 0.95), 3),
            'quality': round(random.uniform(0.6, 0.9), 3)
        }

        status = "✓ LOOKING" if is_looking else "✗ not looking"
        print(f"  Track {track_id:2d}: yaw={yaw:6.2f}°, pitch={pitch:6.2f}° - {status}")

    # Save updated metadata
    with open(metadata_path, 'w') as f:
        json.dump(data, f, indent=2)

    # Count stats
    looking = sum(1 for t in tracks if t['gaze_data']['looking_at_camera'])
    total = len(tracks)

    print(f"\n✅ Done! {looking}/{total} ({looking/total*100:.1f}%) looking at camera")

if __name__ == "__main__":
    add_synthetic_gaze("public/data/metadata.json")
