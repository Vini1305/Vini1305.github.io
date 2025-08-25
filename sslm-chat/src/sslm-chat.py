""" train_dataset = [
"Olá! Como você está?",
"Oi! Tudo bem com você?",
"Bom dia! Espero que você tenha um ótimo dia.",
"Boa tarde! Como posso te ajudar hoje?",
"Boa noite! Espero que você esteja bem.",
"Oi! É um prazer falar com você.",
"Olá! Em que posso te ajudar?",
"Oi! Espero que você esteja tendo um bom dia.",
"Olá! Como posso ser útil para você hoje?",
"Oi! Que bom te ver por aqui."
] """

with open ("dataset.txt", "r", encoding="utf-8") as file:
    file = file.readlines()

train_dataset = []
for line in file:
    train_dataset.append(line.replace("\n",""))

index = {}

def index_token(token : str, contador : int):
    if token not in index:
        index[token] = contador

def tokenize(dataset: list):
    tokenized_dataset = []
    for sentence in dataset:
        tokenized_dataset.append(sentence.split())

    contador = 0
    for sentence in tokenized_dataset:
        for token in sentence:
            index_token(token, contador)
            contador += 1
    return tokenized_dataset

tokenized_dataset = tokenize(train_dataset)

def sentences_to_ids(tokenized_dataset, index):
    dataset_ids = []
    for sentence in tokenized_dataset:
        sentence_ids = [index[token] for token in sentence]
        dataset_ids.append(sentence_ids)
    return dataset_ids

dataset_ids = sentences_to_ids(tokenized_dataset, index)
print(dataset_ids)  # Verifique as sequências de IDs geradas

def pad_sequences(sequences, max_length, padding_value=0):
    padded_sequences = []
    for seq in sequences:
        if len(seq) < max_length:
            # Adiciona padding no final
            padded_seq = seq + [padding_value] * (max_length - len(seq))
        else:
            # Trunca a sequência
            padded_seq = seq[:max_length]
        padded_sequences.append(padded_seq)
    return padded_sequences

# Defina o comprimento máximo desejado
max_length = 10
padded_dataset_ids = pad_sequences(dataset_ids, max_length)

print(padded_dataset_ids)  # Verifique as sequências padronizadas

from collections import defaultdict

def calculate_token_probabilities(sequences):
    transition_counts = defaultdict(lambda: defaultdict(int))
    transition_probabilities = {}

    # Contar transições entre tokens
    for seq in sequences:
        for i in range(len(seq) - 1):
            current_token = seq[i]
            next_token = seq[i + 1]
            transition_counts[current_token][next_token] += 1

    # Calcular probabilidades normalizadas
    for token, next_tokens in transition_counts.items():
        total_transitions = sum(next_tokens.values())
        transition_probabilities[token] = {
            next_token: count / total_transitions
            for next_token, count in next_tokens.items()
        }

    return transition_probabilities

# Exemplo de uso
token_probabilities = calculate_token_probabilities(dataset_ids)
print(token_probabilities)  # Verifique o índice de probabilidades gerado

import random

def generate_response(message, index, token_probabilities):
    # Tokenizar a mensagem e verificar se a última palavra está no índice
    tokens = message.split()
    last_word = tokens[-1] if tokens else None

    if last_word not in index:
        return "Desculpe, não entendi sua mensagem."

    # Obter o ID do último token
    current_token_id = index[last_word]
    response_ids = []

    # Gerar a resposta com base nas probabilidades
    while current_token_id != 0:  # Termina quando o token 0 é alcançado
        response_ids.append(current_token_id)
        next_token_probs = token_probabilities.get(current_token_id, {})

        if not next_token_probs:
            break  # Se não houver transições, encerra a geração

        # Escolher o próximo token com base nas probabilidades
        next_token_id = random.choices(
            list(next_token_probs.keys()),
            weights=list(next_token_probs.values())
        )[0]
        current_token_id = next_token_id

    # Converter os IDs gerados de volta para palavras
    reverse_index = {v: k for k, v in index.items()}
    response_tokens = [reverse_index[token_id] for token_id in response_ids]

    return " ".join(response_tokens)

# Exemplo de uso
user_message = "Oi!"
response = generate_response(user_message, index, token_probabilities)
print(f"Usuário: {user_message}")
print(f"Modelo: {response}")

from collections import defaultdict

def calculate_ngram_probabilities(sequences, n=2):
    transition_counts = defaultdict(lambda: defaultdict(int))
    transition_probabilities = {}

    # Contar transições entre n-gramas
    for seq in sequences:
        for i in range(len(seq) - n + 1):
            ngram = tuple(seq[i:i + n - 1])  # Contexto (n-1 tokens)
            next_token = seq[i + n - 1]  # Próximo token
            transition_counts[ngram][next_token] += 1

    # Calcular probabilidades normalizadas
    for ngram, next_tokens in transition_counts.items():
        total_transitions = sum(next_tokens.values())
        transition_probabilities[ngram] = {
            next_token: count / total_transitions
            for next_token, count in next_tokens.items()
        }

    return transition_probabilities

# Atualizar a geração de respostas para usar n-gramas
def generate_response_with_context(message, index, token_probabilities, n=2):
    tokens = message.split()
    if not tokens:
        return "Desculpe, não entendi sua mensagem."

    # Obter o contexto inicial (n-1 últimos tokens)
    context = tuple(tokens[-(n - 1):]) if len(tokens) >= n - 1 else tuple(tokens)
    context_ids = [index.get(token, None) for token in context]

    if None in context_ids:
        return "Desculpe, não entendi sua mensagem."

    response_ids = list(context_ids)

    # Gerar a resposta com base nas probabilidades de n-gramas
    while True:
        current_ngram = tuple(response_ids[-(n - 1):])  # Últimos n-1 tokens
        next_token_probs = token_probabilities.get(current_ngram, {})

        if not next_token_probs:
            break  # Se não houver transições, encerra a geração

        # Escolher o próximo token com base nas probabilidades
        next_token_id = random.choices(
            list(next_token_probs.keys()),
            weights=list(next_token_probs.values())
        )[0]
        response_ids.append(next_token_id)

        # Termina se o token gerado for o de padding (0)
        if next_token_id == 0:
            break

    # Converter os IDs gerados de volta para palavras
    reverse_index = {v: k for k, v in index.items()}
    response_tokens = [reverse_index[token_id] for token_id in response_ids if token_id in reverse_index]

    return " ".join(response_tokens)

# Recalcular as probabilidades usando bigramas (n=2)
token_probabilities = calculate_ngram_probabilities(dataset_ids, n=2)

# Exemplo de uso
user_message = "Oi! Tudo bem"
response = generate_response_with_context(user_message, index, token_probabilities, n=2)
print(f"Usuário: {user_message}")
print(f"Modelo: {response}")

def learn_from_message(message, index, tokenized_dataset, dataset_ids, token_probabilities, n=2):
    # Tokenizar a nova mensagem
    new_tokens = message.split()
    
    # Atualizar o índice com novos tokens
    contador = max(index.values(), default=-1) + 1
    for token in new_tokens:
        if token not in index:
            index[token] = contador
            contador += 1

    # Atualizar o conjunto de dados tokenizado
    new_sentence_ids = [index[token] for token in new_tokens]
    tokenized_dataset.append(new_tokens)
    dataset_ids.append(new_sentence_ids)

    # Recalcular as probabilidades de transição
    token_probabilities.update(calculate_ngram_probabilities(dataset_ids, n=n))

    print(f"Nova mensagem aprendida: {message}")
    print(f"Novo índice: {index}")
    print(f"Novas probabilidades: {token_probabilities}")

# Exemplo de uso
new_message = "Oi! Como você está?"
learn_from_message(new_message, index, tokenized_dataset, dataset_ids, token_probabilities, n=2)

# Testar a geração de resposta após o aprendizado
user_message = "Oi! Como você"
response = generate_response_with_context(user_message, index, token_probabilities, n=2)
print(f"Usuário: {user_message}")
print(f"Modelo: {response}")