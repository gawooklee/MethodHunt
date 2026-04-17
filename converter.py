import json
import random

intransitive_verbs = {
    'fall', 'exist', 'occur', 'remain', 'happen', 'go', 'come', 'arrive', 
    'rise', 'live', 'die', 'seem', 'appear', 'emerge', 'escape', 'wait', 
    'stay', 'return', 'belong', 'depend', 'consist', 'succeed', 'fail',
    'react', 'respond', 'listen', 'talk', 'speak', 'look', 'sleep', 'sit',
    'stand', 'walk', 'run', 'fly', 'swim', 'travel', 'depart', 'climb'
}

protocol_mappings = {
    'fall': 'down', 'drop': 'down', 'decrease': 'down',
    'rise': 'up', 'ascend': 'up', 'increase': 'up', 'climb': 'up',
    'escape': 'from', 'depart': 'from', 'leave': 'from', 'derive': 'from',
    'enter': 'into', 'transform': 'into', 'convert': 'into', 'change': 'into',
    'arrive': 'at', 'look': 'at', 'aim': 'at',
    'go': 'to', 'return': 'to', 'belong': 'to', 'contribute': 'to', 'refer': 'to',
    'come': 'from', 
    'connect': 'with', 'agree': 'with', 'interfere': 'with', 'deal': 'with',
    'depend': 'on', 'rely': 'on', 'focus': 'on', 'base': 'on',
    'consist': 'of', 'think': 'of',
    'succeed': 'in', 'fail': 'in', 'result': 'in', 'participate': 'in',
    'wait': 'for', 'search': 'for', 'ask': 'for',
    'pass': 'through', 'go through': 'through',
    'separate': 'from',
    'add': 'to', 'attach': 'to'
}

def assign_layer(v):
    transfer_keywords = ['send', 'deliver', 'share', 'move', 'go', 'come', 'escape', 'fly', 'drop', 'arrive', 'pass']
    repair_keywords = ['fix', 'adjust', 'heal', 'redefine', 'distort', 'warn', 'fail', 'damage', 'break']
    memory_keywords = ['carry', 'keep', 'hold', 'breathe', 'save', 'forget', 'exist', 'live', 'die']
    connection_keywords = ['tie', 'untie', 'connect', 'unite', 'separate', 'attach', 'join', 'add']
    
    if any(k in v for k in transfer_keywords): return 'Transfer'
    if any(k in v for k in repair_keywords): return 'Repair'
    if any(k in v for k in memory_keywords): return 'Memory'
    if any(k in v for k in connection_keywords): return 'Connection'
    return 'Process'

def assign_protocol(layer, v):
    # Override with specific physical mappings
    if v in protocol_mappings:
        return protocol_mappings[v]
        
    for k, p in protocol_mappings.items():
        if k in v: return p
        
    if layer == 'Transfer': return random.choice(['to', 'from', 'through', 'out', 'across', 'via', 'forth'])
    if layer == 'Repair': return random.choice(['back', 'against', 'without', 'over', 'off'])
    if layer == 'Memory': return random.choice(['in', 'within', 'behind', 'beneath', 'on'])
    if layer == 'Connection': return random.choice(['with', 'between', 'among', 'by'])
    return random.choice(['into', 'beyond', 'beside', 'about', 'around', 'above', 'below', 'up', 'down'])

def assign_delta_type(layer):
    if layer == 'Transfer': return random.choice(['Move', 'Export', 'Import', 'Routing'])
    if layer == 'Repair': return random.choice(['Restore', 'Patch', 'Rebuild', 'Delete'])
    if layer == 'Memory': return random.choice(['Cache', 'Save', 'Hold', 'Flush'])
    if layer == 'Connection': return random.choice(['Link', 'Unlink', 'Merge', 'Isolate'])
    return random.choice(['Casting', 'Filter', 'Calculate', 'Format'])

def get_adjective_state(item):
    if item.get('a') and len(item['a']) > 0:
        return item['a'][0]['w'].capitalize()
    return "Processed"

def generate_sentence(v, protocol, is_intransitive):
    if is_intransitive:
        sentences = [
            f"The data will {v} {protocol} the terminal.",
            f"Watch how the process {v}s {protocol} the network.",
            f"Once the system loads, the object can {v} {protocol} the main server.",
            f"The core module is designed to {v} {protocol} the target."
        ]
    else:
        sentences = [
            f"The system needs to {v} the data {protocol} the main server.",
            f"You must {v} the variables {protocol} the loop.",
            f"We will {v} the process {protocol} the designated port.",
            f"Please verify when you {v} the object {protocol} the environment."
        ]
    
    # blank out the verb, handling potential "s" form in intransitive
    sentence = random.choice(sentences)
    if f" {v}s " in sentence:
        sentence = sentence.replace(f" {v}s ", " _____s ")
    else:
        sentence = sentence.replace(f" {v} ", " _____ ")
        
    return sentence

def get_distractors(words, correct):
    d = []
    attempts = 0
    while len(d) < 3 and attempts < 100:
        w = random.choice(words)['v']
        if w != correct and w not in d:
            d.append(w)
        attempts += 1
    return d

def process_file():
    with open('words.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    all_verbs = data
    new_data = []
    
    for i, item in enumerate(data):
        v = item['v']
        v_ko = item['v_ko']
        
        is_intransitive = v in intransitive_verbs
        
        layer = assign_layer(v)
        protocol = assign_protocol(layer, v)
        adj_state = get_adjective_state(item)
        delta_type = assign_delta_type(layer)
        
        before_state = f"초기 상태: 노드가 '{v_ko}' 작업을 대기 중이거나 에러 상태임."
        method_guide = f"[{protocol}] 규격을 활용하여 시스템에서 '{v_ko}' 연산을 연결하세요."
        after_state = f"패치 완료. 데이터가 [{adj_state}] 상태로 확정 및 라우팅 되었습니다."
        
        delta_result = f"Raw Data -> {adj_state} Object ({delta_type} 완료)"
        distractors = get_distractors(all_verbs, v)
        
        new_item = {
            "id": i + 1,
            "method": v,
            "ipa": item.get('ipa', ''),
            "layer": layer,
            "protocol": protocol,
            "logic_flow": {
                "before": before_state,
                "method_guide": method_guide,
                "after": after_state
            },
            "delta_check": {
                "type": delta_type,
                "result": delta_result
            },
            "quiz": {
                "instruction": f"[{protocol}] 물리적 방향성이 포함된 핵심 메소드를 호출하세요.",
                "sentence": generate_sentence(v, protocol, is_intransitive),
                "answer": v,
                "distractors": distractors
            },
            "extensions": {
                "nouns": item.get('n', []),
                "adjectives": item.get('a', [])
            },
            "tip": f"{'자동사(Intransitive)' if is_intransitive else '타동사(Transitive)'} 로직 특성을 가진 메소드입니다."
        }
        
        new_data.append(new_item)
        
    with open('LogicEngine_Data.json', 'w', encoding='utf-8') as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    process_file()
    print("LogicEngine_Data.json 재생성 및 규격 패치 완료!")
