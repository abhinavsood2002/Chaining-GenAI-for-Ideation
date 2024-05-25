from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
import io
import os
import csv
from datetime import datetime
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from user_tasks import *
JSON_FOLDER = "PredefinedTemplates"


class APILogger:
    def __init__(self, logs_dir='logs'):
        self.logs_dir = logs_dir
        if not os.path.exists(logs_dir):
            os.makedirs(logs_dir)

    def _get_user_dir(self, user_id):
        user_dir = os.path.join(self.logs_dir, user_id)
        if not os.path.exists(user_dir):
            os.makedirs(user_dir)
            os.makedirs(os.path.join(user_dir, 'records'))
            # Create log.csv if it doesn't exist
            with open(os.path.join(user_dir, 'log.csv'), 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(['timestamp', 'api_function', 'record_file'])
        return user_dir

    def log_api_call(self, user_id, api_function, inputs, outputs):
        user_dir = self._get_user_dir(user_id)
        log_file = os.path.join(user_dir, 'log.csv')
        record_id = datetime.now().strftime('%Y%m%d_%H%M%S')
        record_file = f'{record_id}_{api_function}.txt'
        record_path = os.path.join(user_dir, 'records', record_file)

        # Write inputs and outputs to a separate record file
        with open(record_path, 'w') as f:
            f.write(f"API Function: {api_function}\n")
            f.write(f"Timestamp: {datetime.now().isoformat()}\n\n")
            f.write("Inputs:\n")
            for key, value in inputs.items():
                f.write(f"{key}: {value}\n")
            f.write("\nOutputs:\n")
            for key, value in outputs.items():
                f.write(f"{key}: {value}\n")

        # Log to CSV
        with open(log_file, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([datetime.now().isoformat(), api_function, record_file])

# Initialise the logger
logger = APILogger()

# Initialise text to image model
model_id = "stabilityai/stable-diffusion-2-1"
device = "cuda"
pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
pipe = pipe.to(device)

# Initialise Large language model
model_id = "teknium/OpenHermes-2.5-Mistral-7B"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id, device_map="auto")
chat_pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer)

def instruction_for_text_length(textLength):
    match textLength:
        case "very short":
            return "Ensure your response is very short (30-70 words)."
        case "short":
            return "Ensure your response is short (70-150 words)."
        case "medium":
            return "Ensure your response is medium (150-300 words) in length."
        case "long":
            return "Ensure your response is thorough (300+ words) in length."

def run_prompt(prompt, temperature):
    do_sample = temperature != 0
    messages = [{
                "role": "system",
                "content":"You are a helpful AI assistant assisting the user with a creative task."},
                {"role": "user",
                 "content": prompt}]
    inputs = tokenizer.apply_chat_template(messages, return_tensors="pt").to("cuda")
    outputs = model.generate(inputs, do_sample=do_sample, temperature=temperature, top_p=0.9, max_new_tokens=5000)
    prompt_length = inputs[0].shape[0]
    output = tokenizer.decode(outputs[0][prompt_length:], skip_special_tokens=True)
    return output

app = Flask(__name__)
CORS(app)

@app.route('/api/run/chain_node', methods=['GET'])
def run_chain_node():
    user_id = request.args.get('userid')
    prompt = request.args.get('prompt')
    input_ = request.args.get('input')
    temperature = float(request.args.get('temperature'))
    textLength = request.args.get('length')
    prompt_updated = f"""Use the given context to complete the given instruction. Do not repeat the instructions or context given. {instruction_for_text_length(textLength)}
Instruction:
{prompt}

Context:
{input_}"""
    output = run_prompt(prompt_updated, temperature)

    response = {'output': output}
    logger.log_api_call(user_id, 'run_chain_node', {
        'prompt': prompt,
        'input': input_,
        'temperature': temperature,
        'length': textLength
    }, response)

    return jsonify(response)

@app.route('/api/run/prompt_node', methods=['GET'])
def run_prompt_node():
    user_id = request.args.get('userid')
    prompt = request.args.get('prompt')
    temperature = float(request.args.get('temperature'))
    textLength = request.args.get('length')
    prompt_updated = f"""{prompt} Do not repeat the instructions given. {instruction_for_text_length(textLength)}
"""
    output = run_prompt(prompt_updated, temperature)

    response = {'output': output}
    logger.log_api_call(user_id, 'run_prompt_node', {
        'prompt': prompt,
        'temperature': temperature,
        'length': textLength
    }, response)

    return jsonify(response)

@app.route('/api/run/txt_to_img_node', methods=['GET'])
def run_txt_to_image_node():
    user_id = request.args.get('userid')
    prompt = request.args.get('prompt')
    image = pipe(prompt).images[0]
    img_io = io.BytesIO()
    image.save(img_io, format="PNG")
    img_io.seek(0)

    response = {'image': 'Generated image'}
    logger.log_api_call(user_id, 'run_txt_to_image_node', {'prompt': prompt}, response)

    return send_file(img_io, mimetype='image/png')

@app.route('/api/run/start', methods=['GET'])
def log_run_start():
    user_id = request.args.get('userid')
    logger.log_api_call(user_id, 'run_nodes_start', {}, {})
    return jsonify({"message": "Run started"})

@app.route('/api/run/end', methods=['GET'])
def log_run_end():
    user_id = request.args.get('userid')
    logger.log_api_call(user_id, 'run_nodes_end', {}, {})
    return jsonify({"message": "Run ended"})

@app.route('/api/get-user-templates', methods=['GET'])
def send_multiple_json():
    user_id = request.args.get('userid')
    json_files = user_templates.get(user_id, [])
    json_data = {}
    for file in json_files:
        file_path = os.path.join(JSON_FOLDER, file)
        if os.path.exists(file_path):
            with open(file_path) as f:
                json_data[file] = f.read()
    return jsonify(json_data)

@app.route('/api/get-user-task', methods=['GET'])
def send_user_task():
    user_id = request.args.get('userid')
    if user_id not in user_tasks:
        return jsonify({'error': 'User ID not found'}), 404
    return jsonify({'tasks': user_tasks[user_id]})

@app.route('/api/get-user-order', methods=['GET'])
def send_user_order():
    user_id = request.args.get('userid')
    if user_id not in user_orders:
        return jsonify({'error': 'User ID not found'}), 404
    return jsonify({'orders': user_orders[user_id]})


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    messages = data["messages"]
    # Combine all conversation messages into a single prompt
    conversation = "\n".join(
        [f"{msg['role']}: {msg['content']}" for msg in messages]
    )
    prompt = f"{conversation}\nassistant:"

    # Generate response
    response = chat_pipeline(prompt, max_new_tokens=5000, do_sample=True, temperature=0.7)
    generated_text = response[0]["generated_text"]
    # Extract only the assistant response
    assistant_response = generated_text.split("assistant:")[-1].strip()

    return jsonify({"response": assistant_response})

@app.route('/api/image', methods=['GET'])
def generate_image():
    prompt = request.args.get('prompt')
    image = pipe(prompt).images[0]
    img_io = io.BytesIO()
    image.save(img_io, format="PNG")
    img_io.seek(0)
    return send_file(img_io, mimetype='image/png')

@app.route('/api/submit1', methods=['POST'])
def log_task_submission_1():
    userid = request.args.get('userid')
    task_output = request.args.get('task_output')
    if not userid:
        return jsonify({'status': 'error', 'message': 'userid is required'}), 400

    # Log the submission
    logger.log_api_call(userid, 'submit_task_1', {"output": task_output}, {'message': 'Task submission logged'})

    return jsonify({'status': 'success', 'message': f'Submission logged for user {userid}'})

@app.route('/api/submit2', methods=['POST'])
def log_task_submission_2():
    userid = request.args.get('userid')
    task_output = request.args.get('task_output')
    if not userid:
        return jsonify({'status': 'error', 'message': 'userid is required'}), 400

    # Log the submission
    logger.log_api_call(userid, 'submit_task_2', {"output": task_output}, {'message': 'Task submission logged'})

    return jsonify({'status': 'success', 'message': f'Submission logged for user {userid}'})

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=False, use_reloader=False)