import re

# Đọc file data_goc.js
with open('data_goc.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Tìm skillPotential_en cho Tyr_1
pattern = r'costumeId:\s*"Tyr_1".*?skillPotential_en:\s*\[(.*?)\]'
match = re.search(pattern, content, re.DOTALL)

if match:
    potential_content = match.group(1)
    print(f"Found potential_content: {len(potential_content)} chars")
    print(f"Content: {potential_content}")
    
    # Đếm số objects bằng cách đếm dấu {
    brace_count = 0
    object_count = 0
    in_string = False
    escape_next = False
    
    for char in potential_content:
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
                if brace_count == 0:
                    object_count += 1
                brace_count += 1
            elif char == '}':
                brace_count -= 1
    
    print(f"Object count: {object_count}")
else:
    print("Not found")


