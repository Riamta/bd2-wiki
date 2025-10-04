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
        
        # Kiểm tra xem object này có costumeId hoặc characterId không
        if 'costumeId:' in object_content or 'characterId:' in object_content:
            # Parse costumeId hoặc characterId
            costume_id_match = re.search(r'costumeId:\s*"([^"]+)"', object_content)
            character_id_match = re.search(r'characterId:\s*"([^"]+)"', object_content)
            
            if costume_id_match:
                costume_id = costume_id_match.group(1)
            elif character_id_match:
                costume_id = character_id_match.group(1)
            else:
                continue
            
            # Parse skill_en (chỉ nếu có)
            skill_en_parsed = []
            if 'skill_en:' in object_content:
                skill_en_match = re.search(r'skill_en:\s*\[([^\]]+)\]', object_content)
                if skill_en_match:
                    skill_en_content = skill_en_match.group(1)
                    # Parse array content properly
                    # Remove outer quotes and split by comma, but be careful with nested quotes
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
            
            # Parse skill (format khác - không có _en)
            elif 'skill:' in object_content and 'skill_en:' not in object_content:
                skill_match = re.search(r'skill:\s*\[([^\]]+)\]', object_content)
                if skill_match:
                    skill_content = skill_match.group(1)
                    # Parse array content properly
                    skill_clean = skill_content.strip()
                    if skill_clean:
                        # Split by comma but not inside quotes
                        skills = []
                        current_skill = ""
                        in_quotes = False
                        quote_char = None
                        
                        for char in skill_clean:
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
            
            # Parse level data (chỉ nếu có)
            levels = {}
            if 'level:' in object_content:
                # Format 1: level: {0: `...`, 1: `...`}
                level_match = re.search(r'level:\s*\{([^}]+)\}', object_content, re.DOTALL)
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
                                
                                # Convert key names to lowercase
                                if key == "SP":
                                    key = "sp"
                                elif key == "CD":
                                    key = "cd"
                                
                                # Convert numeric values
                                if value.isdigit():
                                    level_obj[key] = int(value)
                                else:
                                    level_obj[key] = value
                        
                        levels[level_num] = level_obj
                
                # Format 2: level: [{...}, {...}]
                elif 'level:\s*\[' in object_content:
                    level_array_match = re.search(r'level:\s*\[([^\]]+)\]', object_content, re.DOTALL)
                    if level_array_match:
                        level_array_content = level_array_match.group(1)
                        # Parse array of objects
                        level_objects = []
                        # Simple parsing for array of objects
                        # This is a simplified version - might need more sophisticated parsing
                        level_obj = {}
                        for line in level_array_content.split(','):
                            if ':' in line:
                                key, value = line.split(':', 1)
                                key = key.strip().strip('"').strip("'")
                                value = value.strip().strip('"').strip("'")
                                
                                # Convert key names to lowercase
                                if key == "SP":
                                    key = "sp"
                                elif key == "CD":
                                    key = "cd"
                                
                                # Convert numeric values
                                if value.isdigit():
                                    level_obj[key] = int(value)
                                else:
                                    level_obj[key] = value
                        
                        if level_obj:
                            levels[0] = level_obj
            
            # Parse skillPotential_en (chỉ nếu có)
            potential = []
            if 'skillPotential_en:' in object_content:
                # Sử dụng regex phức tạp hơn để match nested brackets
                potential_match = re.search(r'skillPotential_en:\s*\[(.*?)\]', object_content, re.DOTALL)
                if potential_match:
                    potential_content = potential_match.group(1)
                    # Parse potential objects with switches - sử dụng regex đơn giản hơn
                    # Tìm tất cả các object bắt đầu với {
                    potential_objects = []
                    brace_count = 0
                    current_obj = ""
                    in_string = False
                    escape_next = False
                    
                    for char in potential_content:
                        if escape_next:
                            escape_next = False
                            current_obj += char
                            continue
                            
                        if char == '\\':
                            escape_next = True
                            current_obj += char
                            continue
                            
                        if char == '"' and not escape_next:
                            in_string = not in_string
                            current_obj += char
                            continue
                            
                        if not in_string:
                            if char == '{':
                                if brace_count == 0:
                                    current_obj = char
                                else:
                                    current_obj += char
                                brace_count += 1
                            elif char == '}':
                                current_obj += char
                                brace_count -= 1
                                if brace_count == 0:
                                    potential_objects.append(current_obj)
                                    current_obj = ""
                            else:
                                current_obj += char
                        else:
                            current_obj += char
                    
                    # Parse từng object
                    for obj_content in potential_objects:
                        type_match = re.search(r'type:\s*"([^"]+)"', obj_content)
                        value_match = re.search(r'value:\s*"([^"]+)"', obj_content)
                        
                        if type_match and value_match:
                            pot_type = type_match.group(1)
                            pot_value = value_match.group(1)
                            
                            # Parse switches if exists
                            switches = []
                            switches_match = re.search(r'switches:\s*\[([^\]]+)\]', obj_content)
                            if switches_match:
                                switches_content = switches_match.group(1)
                                # Parse individual switch objects
                                switch_pattern = r'\{[^}]*target:\s*"([^"]+)"[^}]*value:\s*(\d+)[^}]*\}'
                                switch_matches = re.finditer(switch_pattern, switches_content)
                                
                                for switch_match in switch_matches:
                                    switch_target = switch_match.group(1)
                                    switch_value = int(switch_match.group(2))
                                    switches.append({
                                        "target": switch_target,
                                        "value": switch_value
                                    })
                            
                            potential_item = {
                                "type": pot_type,
                                "value": pot_value
                            }
                            
                            # Add switches if exists
                            if switches:
                                potential_item["switches"] = switches
                            
                            potential.append(potential_item)
            
            # Parse chain (chỉ nếu có)
            chain_value = None
            if 'chain:' in object_content:
                chain_match = re.search(r'chain:\s*"([^"]+)"', object_content)
                if chain_match:
                    chain_value = chain_match.group(1)
            
            # Parse maxlevel (chỉ nếu có)
            maxlevel = {}
            if 'maxlevel:' in object_content:
                maxlevel_match = re.search(r'maxlevel:\s*\{([^}]+)\}', object_content)
                if maxlevel_match:
                    maxlevel_content = maxlevel_match.group(1)
                    # Parse các trường trong maxlevel
                    atk_match = re.search(r'atk:\s*"([^"]+)"', maxlevel_content)
                    hp_match = re.search(r'hp:\s*"([^"]+)"', maxlevel_content)
                    cr_match = re.search(r'cr:\s*"([^"]+)"', maxlevel_content)
                    cdmg_match = re.search(r'cdmg:\s*"([^"]+)"', maxlevel_content)
                    def_match = re.search(r'def:\s*"([^"]+)"', maxlevel_content)
                    mr_match = re.search(r'mr:\s*"([^"]+)"', maxlevel_content)
                    
                    if atk_match:
                        maxlevel["ATK"] = int(atk_match.group(1))
                    if hp_match:
                        maxlevel["HP"] = int(hp_match.group(1))
                    if cr_match:
                        maxlevel["CR"] = int(cr_match.group(1))
                    if cdmg_match:
                        maxlevel["CRDM"] = int(cdmg_match.group(1))
                    if def_match:
                        maxlevel["DEF"] = int(def_match.group(1))
                    if mr_match:
                        maxlevel["MRES"] = int(mr_match.group(1))
            else:
                # Tìm maxlevel ngay sau object (trong vòng 2000 ký tự)
                after_object = content[end_pos:end_pos+2000]
                maxlevel_after = re.search(r'maxlevel:\s*\{([^}]+)\}', after_object)
                if maxlevel_after:
                    maxlevel_content = maxlevel_after.group(1)
                    # Parse các trường trong maxlevel
                    atk_match = re.search(r'atk:\s*"([^"]+)"', maxlevel_content)
                    hp_match = re.search(r'hp:\s*"([^"]+)"', maxlevel_content)
                    cr_match = re.search(r'cr:\s*"([^"]+)"', maxlevel_content)
                    cdmg_match = re.search(r'cdmg:\s*"([^"]+)"', maxlevel_content)
                    def_match = re.search(r'def:\s*"([^"]+)"', maxlevel_content)
                    mr_match = re.search(r'mr:\s*"([^"]+)"', maxlevel_content)
                    
                    if atk_match:
                        maxlevel["ATK"] = int(atk_match.group(1))
                    if hp_match:
                        maxlevel["HP"] = int(hp_match.group(1))
                    if cr_match:
                        maxlevel["CR"] = int(cr_match.group(1))
                    if cdmg_match:
                        maxlevel["CRDM"] = int(cdmg_match.group(1))
                    if def_match:
                        maxlevel["DEF"] = int(def_match.group(1))
                    if mr_match:
                        maxlevel["MRES"] = int(mr_match.group(1))
            
            # Nếu không tìm thấy maxlevel trong object hiện tại, tìm theo characterId
            if not maxlevel:
                # Tìm characterId
                character_id_match = re.search(r'characterId:\s*"([^"]+)"', object_content)
                if character_id_match:
                    character_id = character_id_match.group(1)
                    # Tìm object có characterId này và có maxlevel
                    character_pattern = rf'characterId:\s*"{character_id}"[^}}]*maxlevel:\s*\{{([^}}]+)\}}'
                    character_match = re.search(character_pattern, content, re.DOTALL)
                    if character_match:
                        maxlevel_content = character_match.group(1)
                        # Parse các trường trong maxlevel
                        atk_match = re.search(r'atk:\s*"([^"]+)"', maxlevel_content)
                        hp_match = re.search(r'hp:\s*"([^"]+)"', maxlevel_content)
                        cr_match = re.search(r'cr:\s*"([^"]+)"', maxlevel_content)
                        cdmg_match = re.search(r'cdmg:\s*"([^"]+)"', maxlevel_content)
                        def_match = re.search(r'def:\s*"([^"]+)"', maxlevel_content)
                        mr_match = re.search(r'mr:\s*"([^"]+)"', maxlevel_content)
                        
                        if atk_match:
                            maxlevel["ATK"] = int(atk_match.group(1))
                        if hp_match:
                            maxlevel["HP"] = int(hp_match.group(1))
                        if cr_match:
                            maxlevel["CR"] = int(cr_match.group(1))
                        if cdmg_match:
                            maxlevel["CRDM"] = int(cdmg_match.group(1))
                        if def_match:
                            maxlevel["DEF"] = int(def_match.group(1))
                        if mr_match:
                            maxlevel["MRES"] = int(mr_match.group(1))
            
            # Lưu character nếu có ít nhất một trong các trường: skill_en, level, potential, chain, hoặc maxlevel
            if skill_en_parsed or levels or potential or chain_value or maxlevel:
                # Nếu character đã tồn tại, merge dữ liệu
                if costume_id in characters:
                    existing = characters[costume_id]
                    if skill_en_parsed:
                        existing["skill_en"] = skill_en_parsed
                    if levels:
                        existing["level"] = levels
                    if potential:
                        existing["skillPotential_en"] = potential
                    if chain_value:
                        existing["chain"] = chain_value
                    if maxlevel:
                        existing["maxlevel"] = maxlevel
                else:
                    characters[costume_id] = {
                        "skill_en": skill_en_parsed,
                        "level": levels,
                        "skillPotential_en": potential,
                        "chain": chain_value,
                        "maxlevel": maxlevel
                    }
            
            # Nếu là characterId và có maxlevel, lưu riêng cho character
            if character_id_match and maxlevel:
                character_name = character_id_match.group(1)
                if character_name not in characters:
                    characters[character_name] = {
                        "maxlevel": maxlevel
                    }
                else:
                    characters[character_name]["maxlevel"] = maxlevel
    
    return characters

def update_json_data(json_file_path: str, characters_data: Dict[str, Any], content: str) -> None:
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
                        # Cập nhật base_skill từ skill_en - nối tất cả các phần tử bằng \n
                        if char_data['skill_en']:
                            costume['skill']['base_skill'] = '\n'.join(char_data['skill_en'])
                        
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
                        
                        # Cập nhật chain
                        if char_data['chain']:
                            costume['skill']['chain'] = int(char_data['chain'])
                        
                # Costume không có maxlevel, chỉ character mới có
                
                # Cập nhật maxlevel cho character nếu có
                if char_data['maxlevel']:
                    character['maxlevel'] = char_data['maxlevel']
                    print(f"Updated maxlevel for character {character.get('id', 'unknown')}: {char_data['maxlevel']}")
                
                # Cập nhật preview cho costume nếu đang trống
                if 'skill' in costume and 'preview' in costume['skill'] and costume['skill']['preview'] == "":
                    # Tìm preview trong data_goc.js cho costume này
                    # Tìm costumeId trước, sau đó tìm youtube trong context
                    costume_id_match = re.search(rf'costumeId:\s*"{costume_id}"', content)
                    if costume_id_match:
                        # Lấy context xung quanh costumeId
                        start = max(0, costume_id_match.start() - 100)
                        end = min(len(content), costume_id_match.end() + 2000)
                        context = content[start:end]
                        
                        # Tìm youtube trong context
                        youtube_match = re.search(r'youtube:\s*"([^"]+)"', context)
                        if youtube_match:
                            costume['skill']['preview'] = youtube_match.group(1)
                            print(f"Updated preview for costume {costume_id}: {youtube_match.group(1)}")
                
        
        # Kiểm tra nếu character có maxlevel từ characterId
        character_id = character.get('id')
        if character_id in characters_data and 'maxlevel' in characters_data[character_id]:
            character['maxlevel'] = characters_data[character_id]['maxlevel']
            print(f"Updated maxlevel for character {character_id} from characterId: {characters_data[character_id]['maxlevel']}")
        
        # Kiểm tra nếu character có skill trực tiếp (không có costumes)
        elif 'skill' in character:
            character_id = character.get('id')
            
            if character_id in characters_data:
                char_data = characters_data[character_id]
                updated_count += 1
                
                # Cập nhật skill data
                # Cập nhật base_skill từ skill_en - nối tất cả các phần tử bằng \n
                if char_data['skill_en']:
                    character['skill']['base_skill'] = '\n'.join(char_data['skill_en'])
                
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
                
                # Cập nhật chain
                if char_data['chain']:
                    character['skill']['chain'] = int(char_data['chain'])
                
                # Cập nhật maxlevel nếu có
                if char_data['maxlevel']:
                    character['maxlevel'] = char_data['maxlevel']
                    print(f"Updated maxlevel for character {character_id}: {char_data['maxlevel']}")
    
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
    # Đọc content để dùng cho preview
    with open(js_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    characters_data = parse_js_data(js_file_path)
    
    print(f"Da tim thay {len(characters_data)} characters co skill_en")
    
    print("Dang cap nhat data_copy.json...")
    update_json_data(json_file_path, characters_data, content)
    
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
