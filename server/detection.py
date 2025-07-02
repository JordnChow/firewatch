from ultralytics import YOLO

video_link = input("Enter video file path or URL (press Enter to use a sample video): ").strip()
if not video_link:
    video_link = "sample.mp4"

model = YOLO('best.pt')
model.predict(source=video_link, save=True, conf=0.5)