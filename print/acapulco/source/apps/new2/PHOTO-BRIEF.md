# Photo brief
For each slug you are given: read /home/claude/routes/new2/<slug>.json, then make 5 AI photos with ONE call to mcp__Magic_Patterns__generate_image (load with ToolSearch "select:mcp__Magic_Patterns__generate_image" if needed), osId "8EwfZmtnxTedYtrG1XXgj9", no addToCanvas.
Images (names "<slug>-cover", "-s1".."-s4"):
- cover: aspectRatio "16:9". Prompt: "Professional photo of <photo_notes.cover>, in Acapulco, Mexico, inviting editorial style, natural light, no people, no text, no logos, no signs".
- s1..s4: aspectRatio "4:3". Prompt: "Professional food photo of <photo_notes.sN> (<signature[N-1]>), appetizing, natural light, shallow depth of field, no people, no hands, no text, no logos, no brand bottles".
The tool result shows each image's local file path like "[Image: source: /root/.claude/.../mcp-Magic_Patterns-blob-XXXX.jpg]" in the same order as requested. Then run:
python3 /home/claude/routes/save_new.py <slug> <cover_path> <s1_path> <s2_path> <s3_path> <s4_path>
Look at each image briefly: if one shows readable text/logos, brand bottles, people's faces in focus, or is clearly the wrong dish, regenerate just that one with a fixed prompt and re-run save_new.py with the new path.
Do not describe images in your reply. Final reply: one line per slug: "slug ok" or "slug FAILED: reason".
