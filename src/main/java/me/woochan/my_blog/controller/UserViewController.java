package me.woochan.my_blog.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import me.woochan.my_blog.config.jwt.TokenProvider;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@RequiredArgsConstructor
@Controller
public class UserViewController {

    private static final String REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

    private final TokenProvider tokenProvider;

    @GetMapping("/login")
    public String login(HttpServletRequest request) {
        if (hasValidRefreshToken(request)) {
            return "redirect:/articles";
        }
        return "oauthLogin";
    }

    @GetMapping("/signup")
    public String signUp() {
        return "signup";
    }

    private boolean hasValidRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return false;
        }
        for (Cookie cookie : cookies) {
            if (REFRESH_TOKEN_COOKIE_NAME.equals(cookie.getName())) {
                return tokenProvider.validToken(cookie.getValue());
            }
        }
        return false;
    }
}
