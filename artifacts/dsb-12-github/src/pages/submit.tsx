import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useCreateFramework, 
  useCreateTemplate, 
  useListFrameworks,
  getListFrameworksQueryKey,
  getListTemplatesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BookOpen, FolderCode } from "lucide-react";

// Schemas
const frameworkSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  category: z.string().min(1, "Please select a category."),
  githubUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
  pypiUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
  officialUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
  version: z.string().min(1, "Version is required."),
  license: z.string().min(1, "License is required."),
  tags: z.string().min(1, "At least one tag is required.")
});

const templateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  frameworkId: z.coerce.number().min(1, "Please select a framework."),
  repoUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
  language: z.string().min(1, "Language is required."),
  difficulty: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select a difficulty level.",
  })
});

export default function SubmitPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Parse query params for initial tab and framework (if coming from framework detail)
  const [activeTab, setActiveTab] = useState("framework");
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "template") {
      setActiveTab("template");
    }
  }, []);

  const { data: frameworks } = useListFrameworks();

  const createFramework = useCreateFramework();
  const createTemplate = useCreateTemplate();

  const fwForm = useForm<z.infer<typeof frameworkSchema>>({
    resolver: zodResolver(frameworkSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      githubUrl: "",
      pypiUrl: "",
      officialUrl: "",
      version: "",
      license: "MIT",
      tags: ""
    }
  });

  const tplForm = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      frameworkId: undefined,
      repoUrl: "",
      language: "Python",
      difficulty: "intermediate"
    }
  });

  // Prefill frameworkId if present in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fwId = params.get("frameworkId");
    if (fwId && activeTab === "template") {
      tplForm.setValue("frameworkId", parseInt(fwId, 10));
    }
  }, [tplForm, activeTab]);

  const onFwSubmit = (values: z.infer<typeof frameworkSchema>) => {
    const data = {
      ...values,
      tags: values.tags.split(",").map(t => t.trim()).filter(Boolean),
      githubUrl: values.githubUrl || undefined,
      pypiUrl: values.pypiUrl || undefined,
      officialUrl: values.officialUrl || undefined,
    };

    createFramework.mutate({ data }, {
      onSuccess: (newFw) => {
        queryClient.invalidateQueries({ queryKey: getListFrameworksQueryKey() });
        toast({ title: "Success", description: "Framework added to PyHub!" });
        setLocation(`/frameworks/${newFw.id}`);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to submit framework.", variant: "destructive" });
      }
    });
  };

  const onTplSubmit = (values: z.infer<typeof templateSchema>) => {
    const data = {
      ...values,
      repoUrl: values.repoUrl || undefined,
    };

    createTemplate.mutate({ data }, {
      onSuccess: (newTpl) => {
        queryClient.invalidateQueries({ queryKey: getListTemplatesQueryKey() });
        toast({ title: "Success", description: "Template added to PyHub!" });
        setLocation(`/templates/${newTpl.id}`);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to submit template.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Submit to PyHub</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Help grow the ecosystem. Add a framework you love or share a boilerplate template you built.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-14">
          <TabsTrigger value="framework" className="text-base gap-2" data-testid="tab-framework">
            <BookOpen className="h-5 w-5" /> Framework
          </TabsTrigger>
          <TabsTrigger value="template" className="text-base gap-2" data-testid="tab-template">
            <FolderCode className="h-5 w-5" /> Template
          </TabsTrigger>
        </TabsList>
        
        {/* FRAMEWORK FORM */}
        <TabsContent value="framework">
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle>Submit Framework</CardTitle>
              <CardDescription>Add a new Python framework, library, or tool to the directory.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...fwForm}>
                <form onSubmit={fwForm.handleSubmit(onFwSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={fwForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. FastAPI" {...field} data-testid="input-fw-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={fwForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-fw-category">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="web">Web Development</SelectItem>
                              <SelectItem value="data">Data Science</SelectItem>
                              <SelectItem value="ml">Machine Learning</SelectItem>
                              <SelectItem value="cli">CLI Tools</SelectItem>
                              <SelectItem value="testing">Testing</SelectItem>
                              <SelectItem value="orm">ORM / Database</SelectItem>
                              <SelectItem value="utility">Utility / Core</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={fwForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="A high performance web framework..." className="resize-none h-24" {...field} data-testid="input-fw-desc" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={fwForm.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latest Version</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 0.103.0" {...field} data-testid="input-fw-version" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={fwForm.control}
                      name="license"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. MIT" {...field} data-testid="input-fw-license" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={fwForm.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="web, async, api (comma separated)" {...field} data-testid="input-fw-tags" />
                        </FormControl>
                        <FormDescription>Comma separated list of keywords.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-medium">Links (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={fwForm.control}
                        name="githubUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">GitHub URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://github.com/..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={fwForm.control}
                        name="pypiUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">PyPI URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://pypi.org/..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={fwForm.control}
                        name="officialUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Official Docs</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" size="lg" disabled={createFramework.isPending} data-testid="btn-submit-fw">
                      {createFramework.isPending ? "Submitting..." : "Submit Framework"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TEMPLATE FORM */}
        <TabsContent value="template">
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle>Submit Template</CardTitle>
              <CardDescription>Share a project boilerplate for others to clone and build upon.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...tplForm}>
                <form onSubmit={tplForm.handleSubmit(onTplSubmit)} className="space-y-6">
                  <FormField
                    control={tplForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. FastAPI React SaaS Starter" {...field} data-testid="input-tpl-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={tplForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="A full stack boilerplate featuring..." className="resize-none h-24" {...field} data-testid="input-tpl-desc" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={tplForm.control}
                      name="frameworkId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Framework</FormLabel>
                          <Select 
                            onValueChange={(val) => field.onChange(parseInt(val, 10))} 
                            value={field.value ? field.value.toString() : ""}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-tpl-framework">
                                <SelectValue placeholder="Select framework" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {frameworks?.map(fw => (
                                <SelectItem key={fw.id} value={fw.id.toString()}>{fw.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>The main Python framework this template uses.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={tplForm.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-tpl-diff">
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={tplForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Language</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Python" {...field} data-testid="input-tpl-lang" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={tplForm.control}
                      name="repoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repository URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://github.com/..." {...field} data-testid="input-tpl-repo" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" size="lg" disabled={createTemplate.isPending} data-testid="btn-submit-tpl">
                      {createTemplate.isPending ? "Submitting..." : "Submit Template"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
