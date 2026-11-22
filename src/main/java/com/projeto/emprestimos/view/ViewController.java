package com.projeto.emprestimos.view;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping({"/", "/view", "/view/"})
    public String inicio() {
        return "redirect:/view/index.html";
    }
}
