'use client';

import React, { useState } from 'react';
import { User } from '@/types/user';
import { registerUser } from '@/lib/auth';
import { z } from 'zod';

interface RegisterFormProps {
  onRegister: (user: User) => void;
  onCancel: () => void;
}

export default function RegisterForm({ onRegister, onCancel }: RegisterFormProps) {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    // パスワード確認
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'パスワードが一致しません' });
      setLoading(false);
      return;
    }

    try {
      const ageNum = parseInt(age);
      
      // Supabaseに登録
      const result = await registerUser({
        email,
        password,
        nickname: nickname.trim(),
        age: ageNum
      });

      if (result.user) {
        // 登録成功
        const newUser: User = {
          nickname: nickname.trim(),
          email,
          age: ageNum,
          registeredAt: new Date().toISOString()
        };
        
        // メール確認なしで登録完了
        setError('登録が完了しました！');
        
        // 2秒後に閉じる
        setTimeout(() => {
          onRegister(newUser);
        }, 2000);
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.issues.forEach(issue => {
          if (issue.path && issue.path[0]) {
            errors[issue.path[0].toString()] = issue.message;
          }
        });
        setFieldErrors(errors);
      } else {
        // エラーメッセージを日本語化
        if (err?.message) {
          setError(err.message);
        } else {
          setError('登録中にエラーが発生しました。もう一度お試しください。');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-black text-gray-900 mb-6 text-center">
          ユーザー登録
        </h2>
        
        <p className="text-gray-700 mb-6 text-center">
          上級・鬼モードをプレイするには登録が必要です
        </p>

        {error && (
          <div className={`px-4 py-3 rounded-lg mb-4 ${
            error.includes('確認メール') 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              ニックネーム
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="プレイヤー名"
              required
              disabled={loading}
            />
            {fieldErrors.nickname && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.nickname}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="example@email.com"
              required
              disabled={loading}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              年齢
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="20"
              min="1"
              max="150"
              required
              disabled={loading}
            />
            {fieldErrors.age && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.age}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="8文字以上、大文字小文字数字を含む"
              required
              disabled={loading}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              パスワード（確認）
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="パスワードを再入力"
              required
              disabled={loading}
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="flex-1 py-3 px-6 bg-blue-600 text-white font-bold rounded-lg
                hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? '登録中...' : '登録'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-6 bg-gray-500 text-white font-bold rounded-lg
                hover:bg-gray-600 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              キャンセル
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          登録することで、利用規約とプライバシーポリシーに同意したものとみなされます
        </p>
      </div>
    </div>
  );
}