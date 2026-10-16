import os
from PIL import Image

output_dir = r"C:\Users\sen\Documents\likyAI\public\assets\influencer"
os.makedirs(output_dir, exist_ok=True)
base_dir = r"C:\Users\sen\.gemini\antigravity\brain\8694b2ad-0a7d-4f8e-b144-1a9e553f01c6\.user_uploaded"

def crop_and_save(img, box, name):
    cropped = img.crop(box)
    target_path = os.path.join(output_dir, f"{name}.jpg")
    cropped.save(target_path, "JPEG", quality=95)

# 4 standard columns across 453px width
cols4 = [(18, 120), (128, 230), (238, 340), (348, 450)]

# 1. cf6122fc: Character types & Gender
cf = Image.open(os.path.join(base_dir, "media_1792052704452_cf6122fc.jpg"))
crop_and_save(cf, (cols4[0][0], 488, cols4[0][1], 592), "type_average")
crop_and_save(cf, (cols4[1][0], 488, cols4[1][1], 592), "type_bold")
crop_and_save(cf, (cols4[2][0], 488, cols4[2][1], 592), "type_extreme")
crop_and_save(cf, (cols4[3][0], 488, cols4[3][1], 592), "type_insect")

crop_and_save(cf, (cols4[0][0], 696, cols4[0][1], 776), "gender_female")
crop_and_save(cf, (cols4[1][0], 696, cols4[1][1], 776), "gender_male")
crop_and_save(cf, (cols4[2][0], 696, cols4[2][1], 776), "gender_transman")
crop_and_save(cf, (cols4[3][0], 696, cols4[3][1], 776), "gender_transwoman")

# 2. 63d8c373: Build & Hairstyle
build_img = Image.open(os.path.join(base_dir, "media_1792052704450_63d8c373.jpg"))
crop_and_save(build_img, (cols4[0][0], 292, cols4[0][1], 370), "build_slim")
crop_and_save(build_img, (cols4[1][0], 292, cols4[1][1], 370), "build_athletic")
crop_and_save(build_img, (cols4[2][0], 292, cols4[2][1], 370), "build_muscular")
crop_and_save(build_img, (cols4[3][0], 292, cols4[3][1], 370), "build_curvy")

crop_and_save(build_img, (cols4[0][0], 466, cols4[0][1], 544), "hair_bob")
crop_and_save(build_img, (cols4[1][0], 466, cols4[1][1], 544), "hair_bald")
crop_and_save(build_img, (cols4[2][0], 466, cols4[2][1], 544), "hair_buzzcut")
crop_and_save(build_img, (cols4[3][0], 466, cols4[3][1], 544), "hair_bowlcut")

# 3. 0711388f: Style & Ethnicity
eth_img = Image.open(os.path.join(base_dir, "media_1792052704451_0711388f.jpg"))
crop_and_save(eth_img, (242, 312, 340, 395), "style_retro")
crop_and_save(eth_img, (352, 312, 450, 395), "style_sporty")

crop_and_save(eth_img, (cols4[0][0], 490, cols4[0][1], 568), "ethnicity_african")
crop_and_save(eth_img, (cols4[1][0], 490, cols4[1][1], 568), "ethnicity_asian")
crop_and_save(eth_img, (cols4[2][0], 490, cols4[2][1], 568), "ethnicity_european")
crop_and_save(eth_img, (cols4[3][0], 490, cols4[3][1], 568), "ethnicity_indian")

# 4. 4d1c5e4c: Height, Proportions & Head shape
prop_img = Image.open(os.path.join(base_dir, "media_1792052706987_4d1c5e4c.jpg"))
cols3 = [(18, 120), (130, 230), (242, 342)]
crop_and_save(prop_img, (cols3[0][0], 314, cols3[0][1], 392), "height_average")
crop_and_save(prop_img, (cols3[1][0], 314, cols3[1][1], 392), "height_tall")
crop_and_save(prop_img, (cols3[2][0], 314, cols3[2][1], 392), "height_verytall")

crop_and_save(prop_img, (cols4[0][0], 490, cols4[0][1], 568), "prop_longlimbs")
crop_and_save(prop_img, (cols4[1][0], 490, cols4[1][1], 568), "prop_shortlegs")
crop_and_save(prop_img, (cols4[2][0], 490, cols4[2][1], 568), "prop_broadshoulders")
crop_and_save(prop_img, (cols4[3][0], 490, cols4[3][1], 568), "prop_tinywaist")

crop_and_save(prop_img, (cols4[0][0], 666, cols4[0][1], 744), "head_standard")
crop_and_save(prop_img, (cols4[1][0], 666, cols4[1][1], 744), "head_long")
crop_and_save(prop_img, (cols4[2][0], 666, cols4[2][1], 744), "head_tiny")
crop_and_save(prop_img, (cols4[3][0], 666, cols4[3][1], 744), "head_highforehead")

# 5. 51f63653: Neck & Eye shape
eye_img = Image.open(os.path.join(base_dir, "media_1792052706986_51f63653.jpg"))
crop_and_save(eye_img, (cols4[0][0], 314, cols4[0][1], 392), "neck_standard")
crop_and_save(eye_img, (cols4[1][0], 314, cols4[1][1], 392), "neck_column")
crop_and_save(eye_img, (cols4[2][0], 314, cols4[2][1], 392), "neck_long")
crop_and_save(eye_img, (cols4[3][0], 314, cols4[3][1], 392), "neck_short")

crop_and_save(eye_img, (cols4[0][0], 490, cols4[0][1], 568), "eye_almond")
crop_and_save(eye_img, (cols4[1][0], 490, cols4[1][1], 568), "eye_round")
crop_and_save(eye_img, (cols4[2][0], 490, cols4[2][1], 568), "eye_monolid")
crop_and_save(eye_img, (cols4[3][0], 490, cols4[3][1], 568), "eye_closeset")

# 6. 8ce02f9f: Features, Facial hair & Distinctive
feat_img = Image.open(os.path.join(base_dir, "media_1792052880016_8ce02f9f.jpg"))
crop_and_save(feat_img, (cols4[0][0], 314, cols4[0][1], 392), "feat_freckles")
crop_and_save(feat_img, (cols4[1][0], 314, cols4[1][1], 392), "feat_dimples")
crop_and_save(feat_img, (cols4[2][0], 314, cols4[2][1], 392), "feat_heavyeyebags")
crop_and_save(feat_img, (cols4[3][0], 314, cols4[3][1], 392), "feat_blush")

crop_and_save(feat_img, (cols4[0][0], 490, cols4[0][1], 568), "hair_clean")
crop_and_save(feat_img, (cols4[1][0], 490, cols4[1][1], 568), "hair_stubble")
crop_and_save(feat_img, (cols4[2][0], 490, cols4[2][1], 568), "hair_fullbeard")
crop_and_save(feat_img, (cols4[3][0], 490, cols4[3][1], 568), "hair_goatee")

crop_and_save(feat_img, (cols4[0][0], 666, cols4[0][1], 744), "distinct_oddeyes")
crop_and_save(feat_img, (cols4[1][0], 666, cols4[1][1], 744), "distinct_facetattoo")
crop_and_save(feat_img, (cols4[2][0], 666, cols4[2][1], 744), "distinct_piercing")
crop_and_save(feat_img, (cols4[3][0], 666, cols4[3][1], 744), "distinct_earpiercing")

# 7. 3c400640: Accessories
acc_img = Image.open(os.path.join(base_dir, "media_1792052881932_3c400640.jpg"))
crop_and_save(acc_img, (cols4[0][0], 656, cols4[0][1], 734), "acc_none")
crop_and_save(acc_img, (cols4[1][0], 656, cols4[1][1], 734), "acc_glasses")
crop_and_save(acc_img, (cols4[2][0], 656, cols4[2][1], 734), "acc_headphones")
crop_and_save(acc_img, (cols4[3][0], 656, cols4[3][1], 734), "acc_jewelry")

print("Recropped all cards without labels!")
