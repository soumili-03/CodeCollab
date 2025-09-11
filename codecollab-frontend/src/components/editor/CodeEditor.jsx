// src/components/editor/CodeEditor.jsx - Professional Code Editor
import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';

const CodeEditor = ({
  language = 'cpp',
  initialCode = '',
  onCodeChange,
  onSubmit,
  onTest,
  isSubmitting = false,
  isTesting = false
}) => {
  const languageOptions = [
    {
      value: 'cpp',
      label: 'C++',
      icon: '⚡',
      template: '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    \n    return 0;\n}'
    },
    {
      value: 'java',
      label: 'Java',
      icon: '☕',
      template: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n        \n    }\n}'
    },
    {
      value: 'python',
      label: 'Python',
      icon: '🐍',
      template: '# Write your solution here\n\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    solve()'
    },
    {
      value: 'javascript',
      label: 'JavaScript',
      icon: '🟨',
      template: '// Write your solution here\n\nfunction solve() {\n    // Your code here\n}\n\nsolve();'
    }
  ];

  const themeOptions = [
    { value: 'vs-dark', label: '🌙 Dark', popular: true },
    { value: 'light', label: '☀️ Light', popular: false },
    { value: 'hc-black', label: '🔲 High Contrast', popular: false }
  ];

  const getInitialCode = () => {
    if (initialCode) return initialCode;
    return languageOptions.find(lang => lang.value === language)?.template || '';
  };

  const [code, setCode] = useState(getInitialCode());
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [theme, setTheme] = useState('vs-dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    const initialCodeValue = getInitialCode();
    onCodeChange?.(initialCodeValue);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure editor
    monaco.editor.defineTheme('codecollab-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
      ],
      colors: {
        'editor.background': '#0F172A',
        'editor.foreground': '#F8FAFC',
        'editorLineNumber.foreground': '#64748B',
        'editor.selectionBackground': '#374151',
        'editor.lineHighlightBackground': '#1E293B',
      }
    });

    monaco.editor.setTheme('codecollab-dark');

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleSubmit();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyT, () => {
      handleTest();
    });
  };

  const handleCodeChange = (value) => {
    setCode(value);
    onCodeChange?.(value);
  };

  const handleLanguageChange = (newLanguage) => {
    setSelectedLanguage(newLanguage);
    const template = languageOptions.find(lang => lang.value === newLanguage)?.template || '';
    setCode(template);
    onCodeChange?.(template);
  };

  const handleSubmit = () => {
    onSubmit?.(code, selectedLanguage);
  };

  const handleTest = () => {
    onTest?.(code, selectedLanguage);
  };

  const formatCode = async () => {
    if (editorRef.current) {
      try {
        await editorRef.current.getAction('editor.action.formatDocument').run();
      } catch (error) {
        console.log('Format error:', error);
      }
    }
  };

  const currentLanguage = languageOptions.find(lang => lang.value === selectedLanguage);

  return (
    <div className={`backdrop-blur-md bg-slate-800/30 border border-purple-500/20 rounded-2xl shadow-2xl
  overflow-hidden transition-all duration-300 ${isFullscreen
        ? 'fixed top-16 left-0 right-0 bottom-2 z-[9999] m-0 rounded-none bg-slate-900/98'
        : 'min-h-[800px] h-[800px]'
      }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm p-4 border-b border-purple-500/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4 flex-wrap">
            {/* Language Selector */}
            <div className="space-y-2 min-w-[140px]">
              <label className="block text-sm font-medium text-purple-300">
                🔤 Language
              </label>
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="appearance-none bg-slate-700/50 border border-purple-500/30 rounded-xl px-3 py-2 pr-8
            text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all
            backdrop-blur-sm text-sm w-full"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.icon} {lang.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <span className="text-purple-400">▼</span>
                </div>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2 min-w-[120px]">
              <label className="block text-sm font-medium text-purple-300">
                🎨 Theme
              </label>
              <div className="relative">
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="appearance-none bg-slate-700/50 border border-purple-500/30 rounded-xl px-3 py-2 pr-8
            text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all
            backdrop-blur-sm text-sm w-full"
                >
                  {themeOptions.map((themeOption) => (
                    <option key={themeOption.value} value={themeOption.value}>
                      {themeOption.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <span className="text-purple-400">▼</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Now properly spaced and responsive */}
          <div className="flex items-center space-x-2 flex-wrap">
            <button
              onClick={formatCode}
              className="px-3 py-2 bg-slate-600/50 hover:bg-slate-600/70 text-purple-300 hover:text-white rounded-xl
        transition-all duration-300 backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/40 text-sm"
              title="Format code (Prettier)"
            >
              <span className="flex items-center space-x-1">
                <span>✨</span>
                <span className="hidden sm:inline">Format</span>
              </span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-3 py-2 bg-slate-600/50 hover:bg-slate-600/70 text-purple-300 hover:text-white rounded-xl
        transition-all duration-300 backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/40 text-sm"
              title="Toggle fullscreen"
            >
              <span>{isFullscreen ? '🗗' : '🗖'}</span>
            </button>

            {onTest && (
              <button
                onClick={handleTest}
                disabled={isTesting}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700
          disabled:from-blue-800 disabled:to-cyan-800 text-white font-semibold rounded-xl transition-all duration-300
          transform hover:scale-105 disabled:scale-100 shadow-lg disabled:opacity-50 text-sm"
                title="Test with sample cases (Ctrl+T)"
              >
                <span className="flex items-center space-x-2">
                  {isTesting ? (
                    <>
                      <span className="animate-spin">⚡</span>
                      <span className="hidden sm:inline">Testing...</span>
                    </>
                  ) : (
                    <>
                      <span>🧪</span>
                      <span>Test</span>
                    </>
                  )}
                </span>
              </button>
            )}

            {onSubmit && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-
          emerald-700 disabled:from-green-800 disabled:to-emerald-800 text-white font-bold rounded-xl transition-all
          duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg disabled:opacity-50 text-sm"
                title="Submit solution (Ctrl+Enter)"
              >
                <span className="flex items-center space-x-2">
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">🚀</span>
                      <span className="hidden sm:inline">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Submit</span>
                    </>
                  )}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>


      {/* Editor Container */}
      <div className={`relative overflow-hidden ${isFullscreen
          ? 'h-[calc(100vh-144px)]'
          : 'h-[calc(800px-160px)]'
        }`}>
        <Editor
          height="100%"
          language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
          value={code}
          theme={theme === 'vs-dark' ? 'codecollab-dark' : theme}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4 animate-bounce">💻</div>
                <div className="text-purple-300">Loading editor...</div>
              </div>
            </div>
          }
          options={{
            fontSize: 16,
            lineHeight: 24,
            fontFamily: '"Fira Code", "JetBrains Mono", "Monaco", monospace',
            fontLigatures: true,
            minimap: { enabled: !isFullscreen },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            roundedSelection: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: true,
              verticalHasArrows: false,
              horizontalHasArrows: false,
              verticalScrollbarSize: 14,
              horizontalScrollbarSize: 14,
            },
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            formatOnType: true,
            formatOnPaste: true,
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true
            },
            parameterHints: {
              enabled: true
            },
            bracketPairColorization: {
              enabled: true
            },
            guides: {
              bracketPairs: true,
              indentation: true
            }
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="bg-slate-900/50 backdrop-blur-sm px-6 py-3 border-t border-purple-500/20">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6 text-purple-300">
            <span className="flex items-center space-x-2">
              <span>{currentLanguage?.icon}</span>
              <span className="font-medium">{currentLanguage?.label}</span>
            </span>
            <span>Ready to code</span>
            <span className="animate-pulse">●</span>
          </div>
          <div className="flex items-center space-x-4 text-gray-400">
            <span>Ctrl+Enter: Submit</span>
            <span>•</span>
            <span>Ctrl+T: Test</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;