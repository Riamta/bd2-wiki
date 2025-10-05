import json
import re
from typing import Dict, Any, List

def parse_js_data(js_file_path: str) -> Dict[str, Any]:
    """
    Parse JavaScript file to extract character data
    """
    with open(js_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    characters = {}
    
    # Tìm tất cả các object có costumeId và skill_en
    # Pattern để tìm các object bắt đầu với var_name = {
    object_pattern = r'(\w+)\s*=\s*\{'
    object_matches = list(re.finditer(object_pattern, content))
    
    for i, match in enumerate(object_matches):
        start_pos = match.start()
        
        # Tìm vị trí kết thúc của object này
        brace_count = 0
        end_pos = start_pos
        in_string = False
        escape_next = False
        
        for j, char in enumerate(content[start_pos:], start_pos):
            if escape_next:
                escape_next = False
                continue
                
            if char == '\\':
                escape_next = True
                continue
                
            if char == '"' and not escape_next:
                in_string = not in_string
                continue
                
            if not in_string:
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        end_pos = j + 1
                        break
        
        # Extract object content
        object_content = content[start_pos:end_pos]
        
        # Kiểm tra xem object này có costumeId và skill_en không
        if 'costumeId:' in object_content and 'skill_en:' in object_content:
            # Parse costumeId
            costume_id_match = re.search(r'costumeId:\s*"([^"]+)"', object_content)
            if not costume_id_match:
                continue
            costume_id = costume_id_match.group(1)
            
            # Parse skill_en
            skill_en_match = re.search(r'skill_en:\s*\[([^\]]+)\]', object_content)
            skill_en_parsed = []
            if skill_en_match:
                skill_en_content = skill_en_match.group(1)
                # Parse array content properly
                skill_en_clean = skill_en_content.strip()
                if skill_en_clean:
                    # Split by comma but not inside quotes
                    skills = []
                    current_skill = ""
                    in_quotes = False
                    quote_char = None
                    
                    for char in skill_en_clean:
                        if char in ['"', "'"] and (not current_skill or current_skill[-1] != '\\'):
                            if not in_quotes:
                                in_quotes = True
                                quote_char = char
                            elif char == quote_char:
                                in_quotes = False
                                quote_char = None
                        elif char == ',' and not in_quotes:
                            if current_skill.strip():
                                skills.append(current_skill.strip().strip('"').strip("'"))
                            current_skill = ""
                            continue
                        
                        current_skill += char
                    
                    if current_skill.strip():
                        skills.append(current_skill.strip().strip('"').strip("'"))
                    
                    skill_en_parsed = skills
            
            # Parse level data
            level_match = re.search(r'level:\s*\{([^}]+)\}', object_content, re.DOTALL)
            levels = {}
            if level_match:
                level_content = level_match.group(1)
                level_pattern = r'(\d+):\s*`([^`]+)`'
                level_matches = re.finditer(level_pattern, level_content)
                
                for level_match in level_matches:
                    level_num = int(level_match.group(1))
                    level_data = level_match.group(2)
                    
                    # Parse level content
                    level_obj = {}
                    for line in level_data.strip().split('\n'):
                        if ':' in line:
                            key, value = line.split(':', 1)
                            key = key.strip()
                            value = value.strip()
                            
                            # Convert numeric values
                            if value.isdigit():
                                level_obj[key] = int(value)
                            else:
                                level_obj[key] = value
                    
                    levels[level_num] = level_obj
            
            # Parse skillPotential_en
            potential_match = re.search(r'skillPotential_en:\s*\[([^\]]+)\]', object_content, re.DOTALL)
            potential = []
            if potential_match:
                potential_content = potential_match.group(1)
                # Parse potential objects
                potential_pattern = r'\{[^}]*type:\s*"([^"]+)"[^}]*value:\s*"([^"]+)"[^}]*\}'
                potential_matches = re.finditer(potential_pattern, potential_content)
                
                for pot_match in potential_matches:
                    pot_type = pot_match.group(1)
                    pot_value = pot_match.group(2)
                    potential.append({
                        "type": pot_type,
                        "value": pot_value
                    })
            
            characters[costume_id] = {
                "skill_en": skill_en_parsed,
                "level": levels,
                "skillPotential_en": potential
            }
    
    return characters

def update_json_data(json_file_path: str, characters_data: Dict[str, Any]) -> None:
    """
    Update JSON file with converted data
    """
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    updated_count = 0
    
    # Tìm và cập nhật dữ liệu cho mỗi character
    for character in data.get('characters', []):
        # Kiểm tra nếu character có costumes
        if 'costumes' in character:
            for costume in character['costumes']:
                costume_id = costume.get('id')
                
                if costume_id in characters_data:
                    char_data = characters_data[costume_id]
                    updated_count += 1
                    
                    # Cập nhật skill data
                    if 'skill' in costume:
                        # Cập nhật base_skill từ skill_en
                        if char_data['skill_en']:
                            costume['skill']['base_skill'] = char_data['skill_en'][0]
                        
                        # Cập nhật levels từ level data
                        if char_data['level']:
                            levels_list = []
                            for level_num in sorted(char_data['level'].keys()):
                                level_data = char_data['level'][level_num]
                                levels_list.append(level_data)
                            costume['skill']['levels'] = levels_list
                        
                        # Cập nhật potential từ skillPotential_en
                        if char_data['skillPotential_en']:
                            costume['skill']['potential'] = char_data['skillPotential_en']
        
        # Kiểm tra nếu character có skill trực tiếp (không có costumes)
        elif 'skill' in character:
            character_id = character.get('id')
            
            if character_id in characters_data:
                char_data = characters_data[character_id]
                updated_count += 1
                
                # Cập nhật skill data
                # Cập nhật base_skill từ skill_en
                if char_data['skill_en']:
                    character['skill']['base_skill'] = char_data['skill_en'][0]
                
                # Cập nhật levels từ level data
                if char_data['level']:
                    levels_list = []
                    for level_num in sorted(char_data['level'].keys()):
                        level_data = char_data['level'][level_num]
                        levels_list.append(level_data)
                    character['skill']['levels'] = levels_list
                
                # Cập nhật potential từ skillPotential_en
                if char_data['skillPotential_en']:
                    character['skill']['potential'] = char_data['skillPotential_en']
    
    print(f"Da cap nhat {updated_count} characters")
    
    # Lưu file đã cập nhật
    with open(json_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def main():
    """
    Main function to convert data from JS to JSON
    """
    js_file_path = 'data_goc.js'
    json_file_path = 'public/data/data_copy.json'
    
    print("Dang parse du lieu tu data_goc.js...")
    characters_data = parse_js_data(js_file_path)
    
    print(f"Da tim thay {len(characters_data)} characters co skill_en")
    
    print("Dang cap nhat data_copy.json...")
    update_json_data(json_file_path, characters_data)
    
    print("Hoan thanh viec chuyen doi du lieu!")
    
    # In ra một vài ví dụ
    for i, (char_id, char_data) in enumerate(characters_data.items()):
        if i < 3:  # Chỉ in 3 ví dụ đầu
            print(f"\nCharacter ID: {char_id}")
            print(f"Skill EN: {char_data['skill_en']}")
            print(f"Levels: {len(char_data['level'])} levels")
            print(f"Potential: {len(char_data['skillPotential_en'])} items")

if __name__ == "__main__":
    main()




