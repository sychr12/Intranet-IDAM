package com.intranet.backend.common.util;

import java.util.regex.Pattern;

public final class StringUtils {

    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
    private static final String CPF_REGEX = "^\\d{3}\\.?\\d{3}\\.?\\d{3}\\-?\\d{2}$";
    private static final String CNPJ_REGEX = "^\\d{2}\\.?\\d{3}\\.?\\d{3}\\/?\\d{4}\\-?\\d{2}$";
    private static final String PHONE_REGEX = "^\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}$";

    private StringUtils() {
        // Utility class
    }

    public static boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    public static boolean isNotNullOrEmpty(String str) {
        return !isNullOrEmpty(str);
    }

    public static String trim(String str) {
        return str != null ? str.trim() : null;
    }

    public static String capitalize(String str) {
        if (isNullOrEmpty(str)) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    public static String capitalizeWords(String str) {
        if (isNullOrEmpty(str)) return str;
        String[] words = str.split(" ");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (!result.isEmpty()) result.append(" ");
            result.append(capitalize(word));
        }
        return result.toString();
    }

    public static String removeAccents(String str) {
        if (isNullOrEmpty(str)) return str;
        String normalized = java.text.Normalizer.normalize(str, java.text.Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
    }

    public static boolean isValidEmail(String email) {
        return !isNullOrEmpty(email) && Pattern.matches(EMAIL_REGEX, email);
    }

    public static boolean isValidCPF(String cpf) {
        if (isNullOrEmpty(cpf)) return false;
        String cleanCpf = cpf.replaceAll("\\D", "");
        if (cleanCpf.length() != 11) return false;

        // Verifica CPF com dígitos iguais
        if (cleanCpf.matches("(\\d)\\1{10}")) return false;

        try {
            int[] digits = new int[11];
            for (int i = 0; i < 11; i++) {
                digits[i] = Integer.parseInt(String.valueOf(cleanCpf.charAt(i)));
            }

            // Valida primeiro dígito
            int sum = 0;
            for (int i = 0; i < 9; i++) {
                sum += digits[i] * (10 - i);
            }
            int firstDigit = 11 - (sum % 11);
            if (firstDigit >= 10) firstDigit = 0;
            if (firstDigit != digits[9]) return false;

            // Valida segundo dígito
            sum = 0;
            for (int i = 0; i < 10; i++) {
                sum += digits[i] * (11 - i);
            }
            int secondDigit = 11 - (sum % 11);
            if (secondDigit >= 10) secondDigit = 0;
            return secondDigit == digits[10];
        } catch (Exception e) {
            return false;
        }
    }

    public static boolean isValidCNPJ(String cnpj) {
        if (isNullOrEmpty(cnpj)) return false;
        String cleanCnpj = cnpj.replaceAll("\\D", "");
        if (cleanCnpj.length() != 14) return false;

        // Verifica CNPJ com dígitos iguais
        if (cleanCnpj.matches("(\\d)\\1{13}")) return false;

        try {
            int[] digits = new int[14];
            for (int i = 0; i < 14; i++) {
                digits[i] = Integer.parseInt(String.valueOf(cleanCnpj.charAt(i)));
            }

            // Valida primeiro dígito
            int[] weights1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
            int sum = 0;
            for (int i = 0; i < 12; i++) {
                sum += digits[i] * weights1[i];
            }
            int firstDigit = 11 - (sum % 11);
            if (firstDigit >= 10) firstDigit = 0;
            if (firstDigit != digits[12]) return false;

            // Valida segundo dígito
            int[] weights2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
            sum = 0;
            for (int i = 0; i < 13; i++) {
                sum += digits[i] * weights2[i];
            }
            int secondDigit = 11 - (sum % 11);
            if (secondDigit >= 10) secondDigit = 0;
            return secondDigit == digits[13];
        } catch (Exception e) {
            return false;
        }
    }

    public static boolean isValidPhone(String phone) {
        return !isNullOrEmpty(phone) && Pattern.matches(PHONE_REGEX, phone);
    }

    public static String maskEmail(String email) {
        if (isNullOrEmpty(email) || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String name = parts[0];
        String domain = parts[1];
        if (name.length() <= 2) {
            return name + "@" + domain;
        }
        String maskedName =
                name.charAt(0) + "*".repeat(name.length() - 2) + name.charAt(name.length() - 1);
        return maskedName + "@" + domain;
    }

    public static String maskPhone(String phone) {
        if (isNullOrEmpty(phone)) return phone;
        String cleanPhone = phone.replaceAll("\\D", "");
        if (cleanPhone.length() < 4) return phone;
        return "*".repeat(cleanPhone.length() - 4) + cleanPhone.substring(cleanPhone.length() - 4);
    }

    public static String truncate(String str, int maxLength) {
        if (isNullOrEmpty(str)) return str;
        if (str.length() <= maxLength) return str;
        return str.substring(0, maxLength) + "...";
    }

    public static String generateSlug(String str) {
        if (isNullOrEmpty(str)) return "";
        String slug = str.toLowerCase();
        slug = removeAccents(slug);
        slug = slug.replaceAll("[^a-z0-9\\s-]", "");
        slug = slug.replaceAll("\\s+", "-");
        slug = slug.replaceAll("-+", "-");
        return slug;
    }
}
