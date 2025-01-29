import { ThemeContext } from '@/context/themeContext';
import { data } from '@/data/todos.js';
import { Inter_500Medium, useFonts } from '@expo-google-fonts/inter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import Animated, { LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const { theme, setColorScheme, colorScheme } = useContext(ThemeContext);

  const [loaded, error] = useFonts({
    Inter_500Medium,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('TodoApp')
        const storageTodos = jsonValue != null ? JSON.parse(jsonValue) : null
        if (storageTodos && storageTodos?.length) {
          setTodos(storageTodos.sort((a, b) => b.id - a.id))
        } else {
          setTodos(data.sort((a, b) => b.id - a.id))
        }
      } catch (error) {
        console.log('error', error)
      }
    }

    fetchData()
  }, [data])

  useEffect(() => {
    const storeData = async () => {
      try {
        const jsonValue = JSON.stringify(todos)
        await AsyncStorage.setItem("TodoApp", JSON.stringify(todos), () => {
          console.log('data stored')
        })
      } catch (error) {
        console.log('error', error);
      }
    }
    storeData()
  }, [todos])

  if (!loaded && !error) {
    return null;
  }

  const addTodo = () => {
    if (text.trim()) {
      const newId = todos.length > 0 ? Math.max(...todos.map(todo => todo.id)) + 1 : 1;
      const newTodo = {
        id: newId,
        title: text.trim(),
        completed: false,
      };
      setTodos([newTodo, ...todos]);
      setText('');
    }
  };


  const toggleTodo = (id) => {
    setTodos(todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const removeTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const renderTodoItem = ({ item }) => (
    <View style={[styles.todoItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <Pressable onPress={() => toggleTodo(item.id)}>
        <Text style={[styles.todoText, item.completed && styles.completedText, { color: item.completed ? theme.completedTask : theme.text }]}>
          {item.title}
        </Text>
      </Pressable>
      <Pressable onPress={() => removeTodo(item.id)} style={styles.removeButton}>
        <Text style={[styles.removeButtonText, { color: theme.text }]}>🗑️</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.themeToggleContainer}>
        <Text style={[styles.themeToggleText, { color: theme.text }]}>Dark Mode</Text>
        <Switch
          value={colorScheme === 'dark'}
          onValueChange={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={colorScheme === 'dark' ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>
      <View style={styles.header}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
          placeholder="Add a new todo"
          placeholderTextColor={theme.text}
          value={text}
          onChangeText={(value) => setText(value.toString())}
          onSubmitEditing={addTodo}
        />
        <Pressable onPress={addTodo} style={[styles.addButton, { backgroundColor: theme.button }]}>
          <Text style={[styles.addButtonText, { color: theme.buttonText }]}>Add</Text>
        </Pressable>
      </View>
      <Animated.FlatList
        data={todos}
        renderItem={renderTodoItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        itemLayoutAnimation={LinearTransition}
        keyboardDismissMode="on-drag"
      />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  themeToggleText: {
    marginRight: 8,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    fontFamily: 'Inter_500Medium',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  addButtonText: {
    fontWeight: 'bold',
  },
  todoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: 'gray',
  },
  todoText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 16,
  },
});
