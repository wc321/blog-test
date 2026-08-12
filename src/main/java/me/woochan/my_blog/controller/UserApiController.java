package me.woochan.my_blog.controller;

import lombok.RequiredArgsConstructor;
import me.woochan.my_blog.dto.AddUserRequest;
import me.woochan.my_blog.service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;

@RequiredArgsConstructor
@Controller
public class UserApiController {

    private final UserService userService;

    @PostMapping("/user")
    public String signUp(AddUserRequest request) {
        userService.save(request);
        return "redirect:/login";
    }
}
