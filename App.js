import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Button, FlatList, Text } from 'react-native';
import axios from 'axios';

const App = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(0);  // Для отслеживания этапов
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    hasJob: false,
    salary: '',
    loanAmount: '',
    loanTerm: '',
  });

  const sendMessage = async () => {
  if (message.trim()) {
    const userMessage = { text: message, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]); // Добавляем сообщение пользователя в конец

    // Остальной код остается без изменений
    switch (step) {
      case 0:  
        await askFirstName();
        break;
      case 1:  
        await askLastName();
        break;
      case 2:  
        await askHasJob();
        break;
      case 3:  
        await askSalary();
        break;
      case 4:  
        await askLoanAmount();
        break;
      case 5:  
        await askLoanTerm();
        break;
      case 6:  
        await submitToLLM();
        break;
      default:
        break;
    }
    setMessage(''); // Очистить поле ввода
  }
};


  const askFirstName = async () => {
    setUserData({ ...userData, firstName: message });
    setMessages(prevMessages => [{ text: 'Какая у вас фамилия?', sender: 'bot' }, ...prevMessages]);
    setStep(1);
  };

  const askLastName = async () => {
    setUserData({ ...userData, lastName: message });
    setMessages(prevMessages => [{ text: 'У вас есть работа? (да/нет)', sender: 'bot' }, ...prevMessages]);
    setStep(2);
  };

  const askHasJob = async () => {
    if (message.toLowerCase() === 'да') {
      setUserData({ ...userData, hasJob: true });
      setMessages(prevMessages => [{ text: 'Какова ваша зарплата?', sender: 'bot' }, ...prevMessages]);
      setStep(3);
    } else {
      setUserData({ ...userData, hasJob: false });
      setMessages(prevMessages => [{ text: 'Извините, без работы кредит невозможен.', sender: 'bot' }, ...prevMessages]);
      setStep(0);  // Сброс этапов для нового пользователя
    }
  };

  const askSalary = async () => {
    setUserData({ ...userData, salary: message });
    setMessages(prevMessages => [{ text: 'Какую сумму кредита вы хотите?', sender: 'bot' }, ...prevMessages]);
    setStep(4);
  };

  const askLoanAmount = async () => {
    setUserData({ ...userData, loanAmount: message });
    setMessages(prevMessages => [{ text: 'На какой срок кредита рассчитываете?', sender: 'bot' }, ...prevMessages]);
    setStep(5);
  };

  const askLoanTerm = async () => {
    setUserData({ ...userData, loanTerm: message });
    setMessages(prevMessages => [{ text: 'Отправляю ваши данные на проверку...', sender: 'bot' }, ...prevMessages]);
    setStep(6);
  };

  const submitToLLM = async () => {
    // Отправляем все данные в модель LLM (заменим ваш API)
    const API_URL = 'https://api-inference.huggingface.co/models/gpt3'; // Подставьте модель
    const API_TOKEN = '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'; // Ваш API токен

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `User: ${JSON.stringify(userData)}`,
        }),
      });

      const data = await response.json();
      const llmResponse = data[0]?.generated_text || 'Произошла ошибка при обработке запроса.';
      
      setMessages(prevMessages => [{ text: llmResponse, sender: 'bot' }, ...prevMessages]);
    } catch (error) {
      console.error('Ошибка получения ответа от модели LLM:', error);
      setMessages(prevMessages => [{ text: 'Произошла ошибка при отправке данных в ИИ.', sender: 'bot' }, ...prevMessages]);
    }
    setStep(0);  // Сброс для нового пользователя
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.message, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder="Напишите сообщение..."
      />
      <Button title="Отправить" onPress={sendMessage} />
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        inverted
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'flex-end',
  },
  message: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '70%',
  },
  userMessage: {
    backgroundColor: '#0084ff',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#e1e1e1',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 2,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 45,
  },
});

export default App;
